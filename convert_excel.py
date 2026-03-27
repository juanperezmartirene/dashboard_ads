"""
Convert BD_elecciones_merged.xlsx to realData.json for the React dashboard.
"""

import json
import os
import sys

# ---------------------------------------------------------------------------
# 1. Dependencies
# ---------------------------------------------------------------------------
try:
    import pandas as pd
except ImportError:
    print("pandas not found — installing…")
    os.system(f"{sys.executable} -m pip install pandas openpyxl")
    import pandas as pd

try:
    import openpyxl  # noqa: F401  (needed by pandas for .xlsx)
except ImportError:
    print("openpyxl not found — installing…")
    os.system(f"{sys.executable} -m pip install openpyxl")

# ---------------------------------------------------------------------------
# 2. Paths
# ---------------------------------------------------------------------------
EXCEL_PATH = r"D:\Proyecto Facebook\Tesis\datos\BD_elecciones_merged.xlsx"
OUTPUT_PATH = r"D:\Proyecto Facebook\Pagina\dashboard\public\data\realData.json"

# ---------------------------------------------------------------------------
# 3. Desired columns
# ---------------------------------------------------------------------------
DESIRED_COLUMNS = [
    "id",
    "ad_snapshot_url",
    "page_name",
    "part_org",
    "pre_pres",
    "lista_sector_candidato",
    "departamento_nacional",
    "fecha",
    "promedio_impresiones",
    "promedio_gasto",
    "tipo_eleccion",
    "text_body",
    "texto_anuncio_completo",
    "tipo",
    "ad_delivery_start_time",
    "ad_delivery_stop_time",
    "impressions_low",
    "impressions_upp",
    "spend_lower",
    "spend_upper",
    "publisher_platforms",
    "page_id",
]

# ---------------------------------------------------------------------------
# 4. Read Excel
# ---------------------------------------------------------------------------
print(f"\nReading: {EXCEL_PATH}")
df = pd.read_excel(EXCEL_PATH, engine="openpyxl")
print(f"Raw shape: {df.shape[0]:,} rows × {df.shape[1]} columns")
print(f"All columns in file: {list(df.columns)}")

# ---------------------------------------------------------------------------
# 5. Select columns
# ---------------------------------------------------------------------------
found_cols    = [c for c in DESIRED_COLUMNS if c in df.columns]
missing_cols  = [c for c in DESIRED_COLUMNS if c not in df.columns]

print(f"\nColumns FOUND    ({len(found_cols)}): {found_cols}")
print(f"Columns MISSING  ({len(missing_cols)}): {missing_cols}")

df = df[found_cols]

# ---------------------------------------------------------------------------
# 6. Clean NaN → None (becomes JSON null)
# ---------------------------------------------------------------------------
df = df.where(pd.notnull(df), other=None)

# Convert any Timestamp columns to ISO strings so they are JSON-serialisable
for col in df.select_dtypes(include=["datetime64[ns]", "datetime64[ns, UTC]"]).columns:
    df[col] = df[col].dt.strftime("%Y-%m-%d").where(df[col].notna(), other=None)

# Also handle object columns that may contain Timestamps
for col in df.select_dtypes(include=["object"]).columns:
    df[col] = df[col].apply(
        lambda v: v.strftime("%Y-%m-%d") if hasattr(v, "strftime") else v
    )

# ---------------------------------------------------------------------------
# 7. Summary stats
# ---------------------------------------------------------------------------
total_rows = len(df)
print(f"\nTotal rows to export: {total_rows:,}")
print(f"Columns in output:    {list(df.columns)}")

print("\n--- First row sample ---")
first_row = df.iloc[0].to_dict()
for k, v in first_row.items():
    print(f"  {k}: {repr(v)}")

# ad_snapshot_url examples
if "ad_snapshot_url" in df.columns:
    print("\n--- ad_snapshot_url examples (first 5) ---")
    for url in df["ad_snapshot_url"].dropna().head(5):
        print(f"  {url}")

# ---------------------------------------------------------------------------
# 8. Write JSON
# ---------------------------------------------------------------------------
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

records = df.to_dict(orient="records")

import math

def clean_value(v):
    if v is None:
        return None
    if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
        return None
    return v

records = [{k: clean_value(v) for k, v in row.items()} for row in records]

with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(records, f, ensure_ascii=False)

file_size_bytes = os.path.getsize(OUTPUT_PATH)
file_size_mb    = file_size_bytes / (1024 * 1024)
print(f"\nJSON written to: {OUTPUT_PATH}")
print(f"File size: {file_size_bytes:,} bytes ({file_size_mb:.2f} MB)")

# ---------------------------------------------------------------------------
# 9. Show first 2 rows of JSON output
# ---------------------------------------------------------------------------
print("\n--- First 2 rows of JSON output ---")
print(json.dumps(records[:2], ensure_ascii=False, indent=2, default=str))

print("\nDone.")
