# Dashboard — Publicidad Política Digital en Meta · Uruguay 2024

## Instrucción permanente

**Después de cada cambio funcional, hacer commit + push a `origin/main`.**
Usar mensajes de commit descriptivos en español. Nunca usar `--no-verify`.

---

## Descripción del proyecto

Dashboard académico para visualizar y analizar **12.096 anuncios políticos uruguayos** publicados en Meta (Facebook e Instagram) durante el ciclo electoral 2023–2024. Clasificados automáticamente con el modelo **ROUBERTa (F1: 0,78)** en 6 tipos funcionales (multi-etiqueta).

**Audiencia:** divulgación.
**Propósito:** comunicar hallazgos del paper y permitir exploración interactiva de datos.
**Deploy:** https://dashboardads.vercel.app/

---

## Stack técnico

- **React 18 + Vite 5** (JSX, no TypeScript)
- **Recharts** — gráficos de barras y líneas (reemplazó D3 en Home)
- **D3.js** — solo usado en componentes legacy (HorizontalBarChart, HeatmapChart, StackedAreaChart)
- **Tailwind CSS 3 + shadcn/ui** — estilos y componentes
- **Lucide React** — iconos
- **motion (framer-motion)** — animaciones popup en DataTable + AnimatedNumber en KPIs
- **clsx + tailwind-merge** — utilidad `cn()` en `src/lib/utils.js`

### Paleta de colores (no modificar sin consultar)

| Token            | Valor       | Uso                           |
| ---------------- | ----------- | ----------------------------- |
| Azul UCU oscuro  | `#173363`   | Header, footer, títulos       |
| Azul UCU medio   | `#1e3d72`   | Secundario                    |
| Celeste acento   | `#0096D1`   | Botón activo, pills, links    |
| Gris fondo       | `#F9FAFB`   | Background secciones alternas |
| Tipos de anuncio | ver abajo   | Consistentes en todos los gráficos |

**Colores por tipo de anuncio:**

- Promoción `#6366F1` · CTA `#3B82F6` · Tema `#10B981`
- Imagen `#F59E0B` · Ceremonial `#8B5CF6` · Ataque `#EF4444`

**Colores por partido (gráficos Home):**

- Partido Nacional `#0EA5E9` · Frente Amplio `#EAB308` · Partido Colorado `#EF4444` · Otros `#6B7280`

---

## Estado actual (al 13/04/2026)

### Datos

- **Datos reales** cargados desde:
  - `/public/data/realData.json` — corpus completo de anuncios
  - `/public/data/clasificacion.json` — clasificaciones ROUBERTa
  - `/public/data/adDetails.json` — datos demográficos por anuncio (edad/género, cargado lazy)
  - `/public/data/departamentos.geojson` — GeoJSON de Uruguay (cargado lazy en HomeDeptMap)
- `processRealData.js` limpia, normaliza y agrega los datos
- Las tipologías ROUBERTa se mergean con `mergeClasificacion()` al cargar
- `mockData.js` y `gastoData.js` existen pero **ya no se usan**

### Navegación

SPA por estado (`page` en `App.jsx`), sin router:

| Página         | ID               | Descripción                                                          |
| -------------- | ---------------- | -------------------------------------------------------------------- |
| Inicio         | `home`           | KPIs, filtros, gráficos, mapa, demografía, top 5, tabla de anuncios |
| Comparación    | `comparacion`    | Dos paneles con filtros independientes para contrastar conjuntos     |
| Clasificación  | `clasificacion`  | Distribución de tipologías ROUBERTa, serie temporal, etapa/partido  |
| Metodología    | `metodologia`    | Descripción del estudio, tipología, corpus                          |
| Equipo         | `equipo`         | Integrantes del proyecto                                             |

### Hooks

| Hook               | Archivo                  | Descripción                                                                          |
| ------------------ | ------------------------ | ------------------------------------------------------------------------------------ |
| useFilteredData    | `useFilteredData.js`     | Centraliza toda la lógica de filtros + cómputos derivados. Usado en Home y Comparación |
| useClickOutside    | `use-click-outside.js`   | Cierra popups al hacer click fuera                                                   |

`useFilteredData` expone: `selectedParties`, `selectedEtapa`, `selectedTerritorio`, `selectedDepartamento`, `selectedPrecandidato`, `precandidatosList`, `lineMetric`, `filteredTable`, `deptData`, `filteredStats`, `timeSeries`, `demoData`, `gastoGenero`, `hasFilters`.

### Componentes activos

| Componente        | Archivo                  | Estado                                                                                 |
| ----------------- | ------------------------ | -------------------------------------------------------------------------------------- |
| Header            | `Header.jsx`             | OK — Nav sticky, backdrop-blur, Sheet mobile, hero dinámico por página                |
| Footer            | `Footer.jsx`             | OK — Links, metodología, fuente, referencias                                           |
| FilterPanel       | `FilterPanel.jsx`        | OK — Partido, etapa, territorio, departamento, precandidato (internas). `defaultOpen` |
| DataTable         | `DataTable.jsx`          | OK — Popup morphing (framer-motion). Link a Meta Ad Library                           |
| HomeCharts        | `HomeCharts.jsx`         | Módulo con todos los gráficos de Home (ver sub-exports abajo)                         |
| DemoPyramid       | `DemoPyramid.jsx`        | OK — Pirámide demográfica por edad/género (standalone, usada en HomeDemoPyramid)      |
| PageComparacion   | `PageComparacion.jsx`    | OK — Dos instancias de useFilteredData + dominios compartidos                         |
| ComparisonPanel   | `ComparisonPanel.jsx`    | OK — Panel individual para PageComparacion (filtros + KPIs + partido + mapa + línea)  |
| PageTipos         | `PageTipos.jsx`          | OK — Página completa de clasificación ROUBERTa                                        |
| MorphingPopover   | `MorphingPopover.jsx`    | Auxiliar para DataTable                                                                |
| InternasTable     | `InternasTable.jsx`      | OK — Tabla sorteable internas por precandidato                                        |
| NacionalesBar     | `NacionalesBar.jsx`      | OK — Barras comparativas nacionales por partido                                       |
| GastoComparativo  | `GastoComparativo.jsx`   | OK — Comparativas de gasto                                                             |
| TopCuentas        | `TopCuentas.jsx`         | OK (legado, reemplazado en Home por HomeTop5 dentro de HomeCharts)                    |

**Sub-exports de `HomeCharts.jsx`:**

| Export            | Descripción                                                              |
| ----------------- | ------------------------------------------------------------------------ |
| `ChartBox`        | Wrapper de tarjeta con título/subtítulo para gráficos                   |
| `AnimatedNumber`  | Número con spring animation (motion/react)                               |
| `HomeKPIs`        | 5 KPIs (modo normal y compacto 3+2)                                     |
| `HomePartyChart`  | Barras horizontales por partido (Recharts), selector de métrica          |
| `HomeDeptMap`     | Mapa coroplético SVG/GeoJSON de Uruguay, selector de métrica             |
| `HomeLineChart`   | Serie temporal por partido (Recharts), selector de métrica, refs electorales |
| `HomeDemoPyramid` | Wrapper de DemoPyramid + barras de gasto por género                     |
| `HomeTop5`        | Top 5 cuentas en tres columnas (anuncios, gasto, impresiones)           |

### Componentes legacy (no usados)

| Componente         | Archivo                    | Nota                                   |
| ------------------ | -------------------------- | -------------------------------------- |
| HorizontalBarChart | `HorizontalBarChart.jsx`   | D3 legacy — evaluar eliminar           |
| StackedAreaChart   | `StackedAreaChart.jsx`     | D3 legacy — evaluar eliminar           |
| HeatmapChart       | `HeatmapChart.jsx`         | D3 legacy — evaluar eliminar           |
| KPICards           | `KPICards.jsx`             | Reemplazado por HomeKPIs               |
| DepartmentChart    | `DepartmentChart.jsx`      | Reemplazado por HomeDeptMap            |
| RegionMap          | `RegionMap.jsx`            | Mapa alternativo — evaluar si se usa   |

### Procesamiento de datos (`src/data/processRealData.js`)

Funciones exportadas:

- `processData()` / `mergeClasificacion()` — carga y merge inicial
- `computeGastoMeta/Partido` — gasto por partido con desglose etapas
- `computeInternasCandidatos` / `computeNacionalesPartidos` — desglose electoral
- `computeTopCuentas` — ranking de cuentas (nacionales)
- `computeDeptDistribution` — distribución por departamento (filtrable)
- `computeFilteredStats` — métricas KPI sobre subset filtrado (byParty, top5, totales)
- `computeTimeSeries` — serie temporal por semana y partido (métrica variable)
- `computeKPIs` — métricas globales iniciales
- `computeHeatmapFromReal` — datos para heatmap (legacy)
- `computeAggregateDemographics` / `computeAggregateDemographicsWithGasto` — pirámide demográfica
- `computeGastoGenero` — gasto estimado por género
- `computePagePartyMap` — mapa page_id → partido (para colorear Top5)
- `computeTiposTotales/Combinaciones/PorEtapa/PorPartido/PorTerritorio` — tipologías
- `computeGastoImpPorTipo` / `computeSerieTemporal` — para PageTipos

---

## Estructura de archivos

```
src/
  App.jsx               — layout principal, todas las páginas, filtros globales
  main.jsx              — entry point
  index.css             — estilos base, paleta UCU, font-size 106.25%
  lib/
    utils.js            — cn() con clsx + tailwind-merge
  hooks/
    use-click-outside.js — hook para cerrar popups
    useFilteredData.js  — hook de filtros + cómputos derivados (Home y Comparación)
  components/
    Header.jsx          — nav sticky + hero + anclas de sección
    Footer.jsx          — footer con links y referencias
    FilterPanel.jsx     — filtros globales (partido, etapa, territorio, depto, precandidato)
    DataTable.jsx       — tabla interactiva con popup morphing
    HomeCharts.jsx      — todos los gráficos de Home (ChartBox, KPIs, barras, mapa, línea, demografía, top5)
    DemoPyramid.jsx     — pirámide demográfica edad/género (standalone)
    PageComparacion.jsx — página de comparación con dos paneles
    ComparisonPanel.jsx — panel individual de comparación
    PageTipos.jsx       — página de clasificación ROUBERTa
    MorphingPopover.jsx — popover animado (auxiliar DataTable)
    InternasTable.jsx   — tabla internas por precandidato
    NacionalesBar.jsx   — barras nacionales
    GastoComparativo.jsx
    TopCuentas.jsx      — (legacy, reemplazado por HomeTop5)
    DepartmentChart.jsx — (legacy, reemplazado por HomeDeptMap)
    RegionMap.jsx       — mapa alternativo (evaluar estado)
    HorizontalBarChart.jsx  — (D3 legacy, no usado)
    StackedAreaChart.jsx    — (D3 legacy, no usado)
    HeatmapChart.jsx        — (D3 legacy, no usado)
    KPICards.jsx            — (legacy, no usado)
    ui/                 — componentes shadcn (button, input, table, badge, sheet, select)
  data/
    processRealData.js  — procesamiento y agregación de datos reales
    mockData.js         — datos sintéticos (legacy, no usado)
    gastoData.js        — datos de gasto (legacy, no usado)
public/
  data/
    realData.json         — corpus completo de anuncios
    clasificacion.json    — clasificaciones ROUBERTa
    adDetails.json        — datos demográficos por anuncio (edad/género)
    departamentos.geojson — GeoJSON departamentos Uruguay
  media/                — imágenes/videos de anuncios (servidos via plugin Vite)
dashboard/
  documentos/           — PDF del paper, media de anuncios
scripts_viejos/         — scripts de extracción y procesamiento (Python/R, no parte del dashboard)
```

---

## Convenciones

- Textos en **español (Uruguay)**: separador decimal coma, miles punto (`toLocaleString('es-UY')`)
- No usar TypeScript — el proyecto es JSX puro
- No agregar dependencias sin necesidad concreta
- Estética: sobria, minimalista, académica. Sin gradientes decorativos, sin animaciones innecesarias
- Tipologías son **multi-etiqueta**: un anuncio puede tener más de un tipo, los % no suman 100%
- Partidos normalizados: `Frente Amplio`, `Partido Nacional`, `Partido Colorado`, `Otros`
- Lógica de filtros centralizada en `useFilteredData.js` — no duplicar estado de filtros en componentes

---

## Pendientes conocidos

1. **Componentes legacy** — HorizontalBarChart, StackedAreaChart, HeatmapChart, KPICards, DepartmentChart, TopCuentas, RegionMap: evaluar eliminar o reintegrar
2. **RegionMap.jsx** — verificar si está en uso o es variante de HomeDeptMap
3. **Limpiar App.jsx** — el archivo es grande (~700 líneas); PageMetodologia y PageEquipo podrían extraerse
