# Cambios de estabilidad y producción - 2026-04-24

## Contexto

La base actual corresponde a la segunda iteración del dataset: `13.310` anuncios.
La clasificación ROUBERTa todavía es provisoria. El código quedó preparado para
funcionar con el archivo actual y con una futura carga definitiva.

## Cambios aplicados

### Seguridad de datos

- Se limpiaron `13.310` URLs de `public/data/realData.json` que contenían
  `access_token` en `ad_snapshot_url`.
- `scripts/csv-to-json.js` ahora elimina `access_token` al regenerar
  `realData.json`.
- `scripts/verify-data.js` ahora falla si detecta `access_token` en
  `public/data/realData.json`.
- `public/data/BD_v2.csv` quedó agregado a `.gitignore`.
- `vite.config.js` elimina `dist/data/BD_v2.csv` y `dist/data/BD_v2.csv.gz` al
  terminar el build, para que el CSV crudo local no salga en el artefacto de
  producción.

### Clasificación provisoria y futura

- `mergeClasificacion()` normaliza claves alternativas:
  - `atack` o `attack` -> `attack`
  - `cta` o `call_to_action` -> `cta`
- Los gráficos de clasificación ya no pierden `Balotaje`: el código usa
  `Balotaje`, que es el valor normalizado desde la base nueva.
- La tabla de anuncios lee tipologías desde `row._clasi`, que es donde queda la
  clasificación mergeada.
- Los textos públicos de clasificación se ajustaron para no presentar el módulo
  como definitivo mientras el archivo final no esté cargado.

### UX y robustez

- El footer ahora navega a páginas reales: `Inicio`, `Comparación`,
  `Clasificación`, `Metodología`, `Equipo`.
- Los selects locales de `DataTable` pasaron a HTML nativo válido.
- Se eliminó `src/components/ui/select.jsx`, que quedó sin usos y tenía una
  implementación incompatible con HTML válido.
- Se eliminó un `console.log` de producción al abrir detalles de anuncios.
- La carga de `realData.json` ahora distingue error real de dataset contra
  ausencia de clasificación/detalles opcionales.
- El modal de detalle usa `spend_low/spend_upp` además de los nombres legacy
  `spend_lower/spend_upper`.

### Datos de segunda iteración

- Textos metodológicos actualizados a:
  - Total: `13.310`
  - Internas: `6.893`
  - Nacionales: `5.989`
  - Balotaje: `428`

## Cómo cargar la clasificación final

El archivo esperado sigue siendo:

```text
public/data/clasificacion.json
```

Formato recomendado:

```json
{
  "AD_ID": {
    "advocacy": 1,
    "attack": 0,
    "image": 1,
    "issue": 0,
    "cta": 1,
    "ceremonial": 0
  }
}
```

El código también acepta temporalmente `atack` y `call_to_action`, pero conviene
normalizar el archivo definitivo a `attack` y `cta`.

Después de reemplazarlo:

```bash
npm.cmd run verify-data
npm.cmd run build
```

## Pendientes documentados

### Performance sin sacrificar datos

El cuello principal es `public/data/realData.json`: ronda los 89 MB sin gzip.
No conviene perder columnas sin revisar uso real, pero sí se puede mejorar:

1. Generar un `realData.index.json` liviano para home/filtros/listados.
2. Mantener detalles completos por anuncio en shards:
   `public/data/details/00.json`, `01.json`, etc.
3. Cargar el detalle completo solo al abrir el modal.
4. Precalcular agregados para Home y Clasificación en build time.
5. Mantener el dataset completo descargable como archivo separado, no como
   dependencia de render inicial.
6. Evaluar Web Worker para filtros y agregaciones si la tabla completa debe
   seguir en cliente.

### Fotos y videos en Vercel

Hoy `/media/...` funciona solo en dev porque `vite.config.js` sirve archivos
desde `dashboard/documentos/media` con un middleware local. En producción Vercel
no tiene esa ruta.

Opciones recomendadas:

1. Subir media a object storage/CDN (Vercel Blob, S3, R2 o similar) y guardar en
   datos un `media_url` por anuncio.
2. Generar thumbnails comprimidos para la tabla/modal y lazy-load de videos.
3. Mantener videos originales fuera del bundle de frontend.
4. Crear un manifest:

```json
{
  "AD_ID": {
    "image": "https://cdn.example.com/images/AD_ID.jpg",
    "video": "https://cdn.example.com/videos/AD_ID.mp4",
    "poster": "https://cdn.example.com/posters/AD_ID.jpg"
  }
}
```

5. Cambiar `useAdMedia()` para leer ese manifest antes de probar rutas locales.

No se recomienda meter todos los videos dentro de `public/`: hay archivos de más
de 200 MB y eso haría el deploy pesado, caro y frágil.

### Tests faltantes

Prioridad para agregar:

- Unit tests de `mergeClasificacion()`.
- Unit tests de `computeTiposPorEtapa()`.
- Unit tests de `computeFilteredBase()`.
- Test de `verify-data` para impedir `access_token`.
- Smoke e2e de navegación Header/Footer.
- Smoke de tabla: tipologías visibles, búsqueda, filtro, modal.

## Arquitectura de datos runtime - 2026-04-24

El cuello principal era `public/data/realData.json`: ronda los 86 MB sin gzip,
y `public/data/adDetails.json` rondaba los 13,9 MB. Se implementó una capa de
artefactos runtime generados, sin borrar las fuentes.

### Auditoría de campos

`realData.json` se usa en runtime para:

- filtros globales: `part_org`, `tipo_eleccion`, `departamento_nacional`,
  `pre_pres`;
- tabla y búsqueda: `id`, `page_id`, `page_name`, fechas, partido,
  departamento, rangos de gasto/impresiones, `text_body`, clasificación;
- charts de Home, Comparación y Clasificación: etapa, partido, departamento,
  fecha, `promedio_impresiones`, `promedio_gasto`, `eficiencia`;
- modal: texto, plataformas, fechas, rangos, sector/lista, tipo y metadatos.

`adDetails.json` se usa para:

- Home y Comparación: solo `demo`, agregado por los filtros activos;
- modal: `demo` y `region` del anuncio abierto.

`clasificacion.json` se usa para mergear `_clasi` por `id` con las claves
`advocacy`, `attack/atack`, `image`, `issue`, `cta/call_to_action` y
`ceremonial`.

### Nueva estructura

El script `scripts/build-data-artifacts.js` genera:

```text
public/data/runtime/
  ads.index.json                 # índice inicial para UI, filtros, tabla y charts
  ad-demographics.index.json     # demo por anuncio para agregados demográficos
  ads.manifest.json              # id -> shard de detalle de anuncio
  ad-details.manifest.json       # id -> shard demográfico/regional
  meta.json                      # conteos y campos incluidos
  ads/00.json ... 99.json        # detalle completo de anuncios por shard
  ad-details/00.json ... 99.json # demo + región por shard
```

El índice inicial pesa aproximadamente `23,38 MB`, un `71,4%` menos que
`realData.json`. Los archivos pesados completos se mantienen regenerables desde
las fuentes y se sirven en shards chicos. El modal carga el shard del anuncio
recién al abrirse, con cache singleton en memoria y protección contra carreras
al desmontar/cambiar de anuncio.

### Scripts

```bash
npm.cmd run prepare-data
npm.cmd run verify-data
npm.cmd run build
```

- `prepare-data`: genera los artefactos runtime.
- `preverify-data` y `prebuild`: regeneran los artefactos automáticamente antes
  de verificar o compilar.
- `verify-data`: valida fuentes, clasificación provisoria, ausencia de
  `access_token` y consistencia básica de los artefactos.

### Deploy

`vite.config.js` elimina del `dist`:

- `data/BD_v2.csv`
- `data/realData.json`
- `data/adDetails.json`
- `data/clasificacion.json`
- sus `.gz`

El runtime usa solo `public/data/runtime/**` y `departamentos.geojson`.

### Cómo regenerar y cargar clasificación final

1. Si cambia el CSV crudo local, correr:

```bash
npm.cmd run convert-data
```

2. Reemplazar `public/data/clasificacion.json` por la clasificación final.
   Conviene normalizar claves a `attack` y `cta`.
3. Regenerar artefactos:

```bash
npm.cmd run prepare-data
npm.cmd run verify-data
npm.cmd run build
```

`clasificacion.json` queda como fuente para regenerar, pero no se publica como
archivo runtime independiente porque sus valores ya quedan integrados en
`ads.index.json` y los shards de `ads/`.

### Tradeoffs y pendientes

- Se conserva la capacidad de ver todos los datos, pero el detalle completo vive
  en shards estáticos; no se agregó backend.
- Los charts demográficos todavía cargan un índice global de `demo`
  (`~9,62 MB`) para mantener filtros instantáneos. Precálculo por combinaciones
  o Web Worker queda como mejora futura si el dataset crece.
- No se precalcularon todos los agregados de Home/Clasificación porque la UI
  permite combinaciones libres de filtros; aplicarlo ahora aumentaría riesgo de
  inconsistencias.
- Fotos y videos siguen pendientes para producción: conviene mover media a CDN
  u object storage, generar thumbnails y cargar videos solo bajo demanda.
