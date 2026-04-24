# Dashboard - Publicidad Politica Digital en Meta · Uruguay 2024

## Instruccion permanente

Despues de cada cambio funcional:

- hacer `git add`, `git commit` y `git push origin main`
- usar mensajes de commit descriptivos en espanol
- no usar `--no-verify`

Nota para agentes: `push` puede requerir permisos o red. Si no se puede ejecutar, dejarlo explicitado.

---

## Que es este proyecto

Dashboard academico para visualizar y analizar **12.096 anuncios politicos uruguayos** publicados en Meta durante el ciclo electoral 2023-2024.

- Audiencia: divulgacion
- Proposito: comunicar hallazgos del paper y permitir exploracion interactiva
- Deploy: `https://dashboardads.vercel.app/`

---

## Stack real

- React 18 + Vite 8
- JSX puro, sin TypeScript
- Tailwind CSS 3
- componentes UI basados en `@base-ui/react`
- Recharts para Home y Comparacion
- D3 solo en `src/components/PageTipos.jsx`
- `motion` para animaciones

---

## Comandos de trabajo

En este repo, en Windows conviene usar `npm.cmd` en vez de `npm` porque PowerShell puede bloquear `npm.ps1`.

- desarrollo: `npm.cmd run dev`
- build: `npm.cmd run build`
- preview: `npm.cmd run preview`
- verificar datos: `npm.cmd run verify-data`
- convertir CSV a JSON: `npm.cmd run convert-data`

Verificacion minima despues de cambios funcionales:

1. `npm.cmd run build`
2. si se toco procesamiento o archivos de datos, `npm.cmd run verify-data`
3. si se toco UI, revisar manualmente la pantalla afectada

---

## Donde tocar segun el cambio

- filtros compartidos: `src/data/filters.js`
- estado derivado y filtros de comparacion: `src/hooks/useFilteredData.js`
- carga y agregacion de datos: `src/data/processRealData.js`
- home y navegacion SPA: `src/App.jsx`
- filtros globales del home: `src/components/FilterPanel.jsx`
- tabla de anuncios y modal detalle: `src/components/DataTable.jsx`
- pagina de comparacion: `src/components/PageComparacion.jsx`, `src/components/ComparisonPanel.jsx`
- clasificacion ROUBERTa: `src/components/PageTipos.jsx`
- colores y tokens: `src/lib/colors.js`
- charts del home: `src/components/HomeCharts/`

---

## Arquitectura que hay que respetar

### Navegacion

La app es una SPA sin router. La pagina activa vive en `page` dentro de `src/App.jsx`.

### Filtros

La logica base de filtrado esta centralizada en `src/data/filters.js`.

- no duplicar filtros en varios componentes
- si aparece un nuevo filtro compartido, agregarlo ahi primero
- `useFilteredData.js` es la referencia para Home y Comparacion

### Datos

Fuentes principales:

- `public/data/realData.json`
- `public/data/clasificacion.json`
- `public/data/adDetails.json`
- `public/data/departamentos.geojson`

Transformaciones principales en `src/data/processRealData.js`:

- `processData()`
- `mergeClasificacion()`
- `computeFilteredStats()`
- `computeTimeSeries()`
- `computeDeptDistribution()`
- funciones `computeTipos*` para `PageTipos`

### Tabla de anuncios

`src/components/DataTable.jsx` maneja:

- filtros locales de tabla
- ordenamiento
- paginacion
- apertura del modal detalle

Si el cambio afecta solo la experiencia de tabla, preferir resolverlo ahi antes de tocar los filtros globales.

---

## Estructura actual del repo

```text
src/
  App.jsx
  main.jsx
  index.css
  lib/
    utils.js
    colors.js
  hooks/
    use-click-outside.js
    useFilteredData.js
  data/
    filters.js
    processRealData.js
  components/
    Header.jsx
    Footer.jsx
    FilterPanel.jsx
    DataTable.jsx
    DemoPyramid.jsx
    RegionMap.jsx
    PageComparacion.jsx
    ComparisonPanel.jsx
    PageTipos.jsx
    InternasTable.jsx
    MorphingPopover.jsx
    HomeCharts/
      Layout.jsx
      Metrics.jsx
      Charts.jsx
      Demographics.jsx
      index.js
    ui/
      button.jsx
      input.jsx
      badge.jsx
      dialog.jsx
      pagination.jsx
      select.jsx
      sheet.jsx
      table.jsx
      tooltip.jsx
public/
  data/
    realData.json
    clasificacion.json
    adDetails.json
    departamentos.geojson
    BD_v2.csv
dashboard/
  documentos/
scripts/
  csv-to-json.js
  verify-data.js
scripts_viejos/
  archivos legacy fuera del dashboard
docs/
  learnings/
  brainstorms/
```

---

## Convenciones

- textos en espanol (Uruguay)
- usar `toLocaleString('es-UY')` para miles y formato numerico visible
- no agregar dependencias nuevas salvo necesidad concreta
- las tipologias son multi-etiqueta; sus porcentajes no suman 100%
- partidos normalizados: `Frente Amplio`, `Partido Nacional`, `Partido Colorado`, `Otros`
- mantener la paleta y los tokens existentes salvo pedido explicito

---

## Estado actual y deuda tecnica real

Puntos importantes confirmados:

- `PageTipos.jsx` sigue usando D3
- `RegionMap.jsx` sigue en uso dentro de `DataTable.jsx`
- el build de produccion compila correctamente con `npm.cmd run build`
- aparecen warnings de `lightningcss` por reglas del ecosistema Tailwind, pero no bloquean el build

Archivos grandes que conviene vigilar:

- `src/components/DataTable.jsx`
- `src/App.jsx`
- `src/data/processRealData.js`
- `src/components/PageTipos.jsx`
- `src/components/HomeCharts/Charts.jsx`

Deuda tecnica prioritaria:

1. partir `DataTable.jsx` si sigue creciendo
2. extraer `PageMetodologia` y `PageEquipo` desde `App.jsx`
3. migrar `PageTipos.jsx` de D3 a Recharts
4. revisar dependencias potencialmente sobrantes antes de nuevas instalaciones

---

## Antes de cambiar algo importante

Leer tambien:

- `docs/learnings/ARCHITECTURAL_FOUNDATIONS.md`
- `docs/production-fixes-2026-04-24.md`

Es lectura recomendada para cambios estructurales, refactors grandes o decisiones de arquitectura.
