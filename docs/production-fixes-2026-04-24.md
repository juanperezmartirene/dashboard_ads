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
