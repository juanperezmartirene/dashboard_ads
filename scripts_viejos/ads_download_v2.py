"""
Descarga de anuncios políticos (Meta Ad Library) para Uruguay.

Requisitos (instalar una vez):
    pip install requests pandas openpyxl tqdm python-dateutil

Autenticación:
    - Definir la variable de entorno META_ADLIBRARY_TOKEN con tu token de acceso:
      En Windows (PowerShell):
          $env:META_ADLIBRARY_TOKEN = "TU_TOKEN_AQUI"
      En Linux/macOS:
          export META_ADLIBRARY_TOKEN="TU_TOKEN_AQUI"

Token: EAATCczYHkZBEBREbTGVzlTZCqQfgtor3ddRHZAmLvKZCUMB2Ci9vV21ZBn1QnVcQpdgUDYY9U9ZCCKFHsWv5xQC4N5qjFBXHQ9ndLm6CimgjGHgH8FgpuPZAiuUZCMZAxzGb9V3w7jZBbt8MoA1Kmk9CZBnH3zLnZAzwplDmsBUQOnW8g1fg7GX21H27eonSvg6GrnS1tTOZBh7j4aSchUwZDZD

Salida (por defecto):
    - Carpeta ./data/raw/<etiqueta_eleccion>/ con:
        * archivos diarios CSV: ads_YYYY-MM-DD.csv
    - Carpeta ./data/processed/ con:
        * BD_totales_<etiqueta_eleccion>.xlsx
        * BD_totales_<etiqueta_eleccion>.csv
        * BD_totales_<etiqueta_eleccion>.pkl
        * errores_<etiqueta_eleccion>.csv

Ejemplos de uso:
    # Internas 2024
    python ads_download_v2.py --date-min 2024-06-01 --date-max 2024-06-30 --label internas_2024

    # Nacionales 2024
    python ads_download_v2.py --date-min 2024-10-01 --date-max 2024-10-31 --label nacionales_2024

    # Balotaje 2024
    python ads_download_v2.py --date-min 2024-11-01 --date-max 2024-11-24 --label balotaje_2024

    # Todo el ciclo 2024
    python ads_download_v2.py --date-min 2023-10-01 --date-max 2024-11-24 --label elecciones_2024
"""

import os
import time
import random
from datetime import datetime, timedelta
from dateutil import parser as dateparser
from pathlib import Path
import argparse

import requests
import pandas as pd
from tqdm import tqdm

# ========= CONFIG GLOBAL =========

API_VERSION = "v25.0"
ENDPOINT_URL = f"https://graph.facebook.com/{API_VERSION}/ads_archive"

# Campos a recuperar (equivalente a tu vector FIELDS en R)
FIELDS = [
    "id",
    "ad_creation_time",
    "ad_creative_bodies",
    "ad_creative_link_captions",
    "ad_creative_link_descriptions",
    "ad_creative_link_titles",
    "ad_delivery_start_time",
    "ad_delivery_stop_time",
    "ad_snapshot_url",
    "bylines",
    "currency",
    "estimated_audience_size",
    "impressions",
    "languages",
    "page_id",
    "page_name",
    "publisher_platforms",
    "spend",
    "demographic_distribution",
    "delivery_by_region",
]

AD_REACHED_COUNTRIES = "UY"
AD_ACTIVE_STATUS = "ALL"
AD_TYPE = "POLITICAL_AND_ISSUE_ADS"
PUBLISHER_PLATFORMS = "facebook,instagram,messenger,whatsapp"
PAGE_LIMIT = 100

MAX_RETRIES = 8
BACKOFF_BASE = 5.0
REQUEST_TIMEOUT = 90
SLEEP_BETWEEN_DAYS = 2.0
MIN_FILE_SIZE_BYTES = 10


class AdLibraryPermissionError(RuntimeError):
    """Sin permiso para usar Meta Ad Library API."""
    pass


class RateLimitError(RuntimeError):
    """Rate limit excedido incluso tras reintentos."""
    pass


def get_access_token() -> str:
    """
    Recupera el token de la variable de entorno META_ADLIBRARY_TOKEN.
    Esto evita subir el token al repositorio.
    """
    token = os.getenv("META_ADLIBRARY_TOKEN", "").strip()
    if not token:
        raise RuntimeError(
            "No se encontró la variable de entorno META_ADLIBRARY_TOKEN.\n"
            "Definila antes de ejecutar el script."
        )
    return token


def daterange(date_min: str, date_max: str):
    """Genera fechas (YYYY-MM-DD) día a día entre date_min y date_max (incluido)."""
    start = datetime.strptime(date_min, "%Y-%m-%d").date()
    end = datetime.strptime(date_max, "%Y-%m-%d").date()

    if start > end:
        raise ValueError("date_min no puede ser mayor que date_max.")

    d = start
    while d <= end:
        yield d.strftime("%Y-%m-%d")
        d += timedelta(days=1)


def build_params(day_str: str, access_token: str) -> dict:
    """Arma los parámetros para una fecha concreta (min=max=day_str)."""
    return {
        "access_token": access_token,
        "ad_reached_countries": AD_REACHED_COUNTRIES,
        "ad_active_status": AD_ACTIVE_STATUS,
        "ad_type": AD_TYPE,
        "ad_delivery_date_min": day_str,
        "ad_delivery_date_max": day_str,
        "search_terms": "NULL",
        "publisher_platforms": PUBLISHER_PLATFORMS,
        "fields": ",".join(FIELDS),
        "limit": PAGE_LIMIT,
    }


def inspect_meta_error(detail) -> str:
    """Extrae un mensaje legible desde el JSON de error de Meta."""
    if isinstance(detail, dict) and "error" in detail:
        err = detail["error"]
        parts = []
        if err.get("message"):
            parts.append(f"message={err.get('message')}")
        if err.get("code") is not None:
            parts.append(f"code={err.get('code')}")
        if err.get("error_subcode") is not None:
            parts.append(f"subcode={err.get('error_subcode')}")
        if err.get("error_user_title"):
            parts.append(f"title={err.get('error_user_title')}")
        if err.get("error_user_msg"):
            parts.append(f"user_msg={err.get('error_user_msg')}")
        return " | ".join(parts)
    return str(detail)


def get_with_retries(url: str, params: dict):
    """GET con reintentos, backoff exponencial, jitter y manejo de rate limits."""
    attempt = 0

    while True:
        try:
            resp = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)

            if resp.status_code == 200:
                return resp.json()

            try:
                detail = resp.json()
            except Exception:
                detail = resp.text

            error_code = None
            error_subcode = None
            if isinstance(detail, dict):
                err = detail.get("error", {})
                error_code = err.get("code")
                error_subcode = err.get("error_subcode")

            # Error de permisos para Ad Library API
            if resp.status_code == 400 and error_code == 10 and error_subcode == 2332002:
                raise AdLibraryPermissionError(
                    "La app/token no tiene permisos para Meta Ad Library API. "
                    f"Detalle: {inspect_meta_error(detail)}"
                )

            # Rate limit específico de Meta
            if error_code == 613:
                if attempt >= MAX_RETRIES:
                    raise RateLimitError(
                        f"Rate limit excedido tras {MAX_RETRIES} reintentos. "
                        f"Detalle: {inspect_meta_error(detail)}"
                    )

                sleep_s = min(300, 15 * (2 ** attempt)) + random.uniform(1, 5)
                print(f"[WARN] Rate limit (code 613). Reintentando en {sleep_s:.1f}s...")
                time.sleep(sleep_s)
                attempt += 1
                continue

            # Errores transitorios
            if resp.status_code in (429, 500, 502, 503, 504):
                if attempt >= MAX_RETRIES:
                    raise RuntimeError(
                        f"HTTP {resp.status_code} tras {MAX_RETRIES} reintentos. "
                        f"Detalle: {inspect_meta_error(detail)}"
                    )

                sleep_s = BACKOFF_BASE * (2 ** attempt) + random.uniform(0.5, 2.5)
                print(f"[WARN] HTTP {resp.status_code}. Reintentando en {sleep_s:.1f}s...")
                time.sleep(sleep_s)
                attempt += 1
                continue

            # Otros errores no recuperables
            raise RuntimeError(f"HTTP {resp.status_code}: {inspect_meta_error(detail)}")

        except (AdLibraryPermissionError, RateLimitError):
            raise

        except requests.RequestException as e:
            if attempt >= MAX_RETRIES:
                raise RuntimeError(f"Error de red tras {MAX_RETRIES} reintentos: {e}") from e

            sleep_s = BACKOFF_BASE * (2 ** attempt) + random.uniform(0.5, 2.5)
            print(f"[WARN] Error de red: {e}. Reintentando en {sleep_s:.1f}s...")
            time.sleep(sleep_s)
            attempt += 1


def normalize_date(x):
    """Normaliza fechas a YYYY-MM-DD."""
    if pd.isna(x):
        return None
    try:
        return dateparser.parse(str(x)).date().strftime("%Y-%m-%d")
    except Exception:
        return None


def fetch_ads_for_day(day_str: str, access_token: str) -> pd.DataFrame:
    """Descarga y pagina resultados para una fecha dada (day_str)."""
    params = build_params(day_str, access_token)
    data_all = []

    # Primera página
    payload = get_with_retries(ENDPOINT_URL, params)

    while True:
        batch = payload.get("data", [])
        data_all.extend(batch)

        # Siguiente página si existe
        paging = payload.get("paging", {})
        next_url = paging.get("next")
        if not next_url:
            break

        # El 'next' ya trae querystring, hacemos GET directo
        payload = get_with_retries(next_url, params={})

    # A DataFrame
    if not data_all:
        return pd.DataFrame(columns=FIELDS)

    df = pd.json_normalize(data_all, max_level=1)

    # Asegurar columnas esperadas
    for col in FIELDS:
        if col not in df.columns:
            df[col] = pd.NA

    df = df[FIELDS]

    # Filtro: ad_delivery_start_time == day_str (igual que en tu R original)
    if "ad_delivery_start_time" in df.columns:
        df["_start_date"] = df["ad_delivery_start_time"].apply(normalize_date)
        df = df[df["_start_date"] == day_str].drop(columns=["_start_date"])

    return df


def can_reuse_daily_file(filepath: Path) -> bool:
    """Verifica si un CSV diario existente puede reutilizarse."""
    if not filepath.exists():
        return False

    try:
        if filepath.stat().st_size < MIN_FILE_SIZE_BYTES:
            return False
    except Exception:
        return False

    try:
        pd.read_csv(filepath, nrows=5)
        return True
    except Exception:
        return False


def read_daily_file(filepath: Path) -> pd.DataFrame:
    """Lee un CSV diario existente y homologa columnas."""
    df = pd.read_csv(filepath)

    for col in FIELDS:
        if col not in df.columns:
            df[col] = pd.NA

    return df[FIELDS]


def test_api_access(access_token: str) -> None:
    """Prueba mínima para validar token/permisos antes de lanzar todo el rango."""
    print("[INFO] Verificando acceso a Meta Ad Library API...")

    params = {
        "access_token": access_token,
        "ad_type": AD_TYPE,
        "ad_reached_countries": AD_REACHED_COUNTRIES,
        "search_terms": "NULL",
        "fields": "id,page_id,page_name,ad_snapshot_url",
        "limit": 1,
    }

    _ = get_with_retries(ENDPOINT_URL, params)
    print("[INFO] Acceso verificado correctamente.")


def parse_args():
    """Parámetros de línea de comandos para hacerlo reutilizable."""
    parser = argparse.ArgumentParser(
        description="Descarga anuncios políticos de la Meta Ad Library para Uruguay."
    )
    parser.add_argument(
        "--date-min",
        required=True,
        help="Fecha mínima (YYYY-MM-DD), inclusive. Ej: 2024-06-01",
    )
    parser.add_argument(
        "--date-max",
        required=True,
        help="Fecha máxima (YYYY-MM-DD), inclusive. Ej: 2024-06-30",
    )
    parser.add_argument(
        "--label",
        default="elecciones_uy",
        help="Etiqueta de la elección / periodo (ej.: internas_2024, nacionales_2024, balotaje_2024).",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    date_min = args.date_min
    date_max = args.date_max
    label = args.label

    # Directorios relativos al repo
    repo_root = Path(__file__).resolve().parent.parent if (Path(__file__).parent.name == "src") else Path(__file__).resolve().parent
    raw_dir = repo_root / "data" / "raw" / label
    processed_dir = repo_root / "data" / "processed"
    raw_dir.mkdir(parents=True, exist_ok=True)
    processed_dir.mkdir(parents=True, exist_ok=True)

    access_token = get_access_token()

    # Test inicial para no lanzar toda la corrida si hay problemas de acceso
    test_api_access(access_token)

    frames = []
    diarios_guardados = []
    errores = []

    print(f"Descargando anuncios UY de {date_min} a {date_max} para '{label}'...")
    for day in tqdm(list(daterange(date_min, date_max)), ncols=100):
        out_csv = raw_dir / f"ads_{day}.csv"

        try:
            # Reanudación: si ya existe y es legible, se reutiliza
            if can_reuse_daily_file(out_csv):
                df_existing = read_daily_file(out_csv)
                frames.append(df_existing)
                diarios_guardados.append(out_csv)
                continue

            # Si existe pero está roto o vacío, se elimina y se rehace
            if out_csv.exists():
                try:
                    out_csv.unlink()
                except Exception:
                    pass

            # Pequeño delay para no saturar la API
            time.sleep(SLEEP_BETWEEN_DAYS)
            df_day = fetch_ads_for_day(day, access_token)

            # Guardado diario (CSV)
            df_day.to_csv(out_csv, index=False, encoding="utf-8-sig")
            diarios_guardados.append(out_csv)

            frames.append(df_day)

        except AdLibraryPermissionError as e:
            print(f"\n[ERROR CRÍTICO] {day}: {e}")
            raise

        except Exception as e:
            print(f"\n[ERROR] {day}: {e}")
            errores.append({"fecha": day, "error": str(e)})
            continue

    # Consolidado
    if frames:
        total = pd.concat(frames, ignore_index=True)
    else:
        total = pd.DataFrame(columns=FIELDS)

    for col in FIELDS:
        if col not in total.columns:
            total[col] = pd.NA
    total = total[FIELDS]

    # Archivos de salida consolidados
    out_xlsx = processed_dir / f"BD_totales_{label}.xlsx"
    out_csv = processed_dir / f"BD_totales_{label}.csv"
    out_pkl = processed_dir / f"BD_totales_{label}.pkl"
    out_errors = processed_dir / f"errores_{label}.csv"

    # Excel
    with pd.ExcelWriter(out_xlsx, engine="openpyxl") as writer:
        total.to_excel(writer, index=False, sheet_name="anuncios_totales")
        if errores:
            pd.DataFrame(errores).to_excel(writer, index=False, sheet_name="errores")

    # CSV y Pickle
    total.to_csv(out_csv, index=False, encoding="utf-8-sig")
    total.to_pickle(out_pkl)

    if errores:
        pd.DataFrame(errores).to_csv(out_errors, index=False, encoding="utf-8-sig")

    print("\nListo ✅")
    print(f"- Archivos diarios disponibles: {len(diarios_guardados)}")
    print(f"- Consolidado Excel: {out_xlsx}")
    print(f"- Consolidado CSV:   {out_csv}")
    print(f"- Pickle pandas:     {out_pkl}")
    if errores:
        print(f"- Log de errores:    {out_errors}")
        print(f"- Días con error:    {len(errores)}")
    print("- Reanudación activada: salta días ya descargados.")
    print("- Filtrado aplicado: ad_delivery_start_time == fecha del día")


if __name__ == "__main__":
    main()