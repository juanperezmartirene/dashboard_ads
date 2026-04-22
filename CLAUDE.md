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
- **Recharts** — gráficos de barras y líneas (usado en Home, Comparación)
- **D3.js** — solo usado en PageTipos (Clasificación) — migración pendiente
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
| HomeCharts        | `HomeCharts/` (módulo)   | 4 módulos semánticos: Layout (primitivos), Metrics (KPIs), Charts (Recharts), Demographics (pirámide+top5). Re-exporta todo vía index.js |
| DemoPyramid       | `DemoPyramid.jsx`        | OK — Pirámide demográfica por edad/género (standalone, usada en HomeDemoPyramid)      |
| PageComparacion   | `PageComparacion.jsx`    | OK — Dos instancias de useFilteredData + dominios compartidos                         |
| ComparisonPanel   | `ComparisonPanel.jsx`    | OK — Panel individual para PageComparacion (filtros + KPIs + partido + mapa + línea)  |
| PageTipos         | `PageTipos.jsx`          | OK — Página completa de clasificación ROUBERTa                                        |
| MorphingPopover   | `MorphingPopover.jsx`    | Auxiliar para DataTable                                                                |
| InternasTable     | `InternasTable.jsx`      | OK — Tabla sorteable internas por precandidato                                        |
| InternasTable     | `InternasTable.jsx`      | OK — Tabla sorteable internas por precandidato                                        |

**Sub-exports de `HomeCharts/` (módulo descompuesto Paso 2):**

| Módulo        | Archivo | Exports |
| ------------- | ------- | --------|
| Layout        | `Layout.jsx` | ChartBox (wrapper tarjeta), AnimatedNumber (spring animation) |
| Metrics       | `Metrics.jsx` | HomeKPIs (5 KPIs, modos normal/compacto 3+2) |
| Charts        | `Charts.jsx` | HomePartyChart (barras/partido, Recharts), HomeDeptMap (mapa coroplético/geoJSON, Recharts), HomeLineChart (serie temporal, Recharts) |
| Demographics  | `Demographics.jsx` | HomeDemoPyramid (pirámide demográfica + gasto género), HomeTop5 (ranking 3 columnas) |

Re-exporta todo vía `HomeCharts/index.js`; imports en App.jsx y ComparisonPanel.jsx funcionan sin cambios.

### Componentes legacy y deuda técnica

| Componente         | Archivo                    | Nota                                   |
| ------------------ | -------------------------- | -------------------------------------- |
| RegionMap          | `RegionMap.jsx`            | En uso en DataTable.jsx; migración a Recharts pendiente |
| PageTipos          | `PageTipos.jsx`            | Usa D3; migración a Recharts pendiente (tarea separada post-Paso 4) |
| NacionalesBar      | `NacionalesBar.jsx`        | D3 legacy — **DEAD CODE** (no importado en ningún lado) |
| GastoComparativo   | `GastoComparativo.jsx`     | D3 legacy — **DEAD CODE** (no importado en ningún lado) |

**Eliminados (Paso 1 refactorización componentes):**
- HorizontalBarChart.jsx (D3 legacy, no usado)
- StackedAreaChart.jsx (D3 legacy, no usado)
- HeatmapChart.jsx (D3 legacy, no usado)
- KPICards.jsx (reemplazado por HomeKPIs)
- DepartmentChart.jsx (reemplazado por HomeDeptMap)
- TopCuentas.jsx (reemplazado por HomeTop5)

**Stack D3 residual (post-Paso 2):**
- HomeCharts: ✓ **SIN D3** (solo Recharts)
- PageTipos: ⚠️ Aún usa D3 (migración posterior)
- vite.config.js: líneas 44-46 mantienen chunking de D3 (aún necesario para PageTipos)

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
- Tipologías son **multi-etiqueta**: un anuncio puede tener más de un tipo, los % no suman 100%
- Partidos normalizados: `Frente Amplio`, `Partido Nacional`, `Partido Colorado`, `Otros`
- Lógica de filtros centralizada en `useFilteredData.js` — no duplicar estado de filtros en componentes

---

## Refactorización completada (Pasos 1-4: Component Modernization)

**✓ TODOS LOS PASOS COMPLETADOS** — 21 de abril de 2026

1. ✓ **Paso 1** — Eliminar componentes legacy D3 no usados
   - Eliminados: HorizontalBarChart, StackedAreaChart, HeatmapChart, KPICards, DepartmentChart, TopCuentas
   
2. ✓ **Paso 2** — Descomponer HomeCharts.jsx monolítico en 4 módulos semánticos
   - **Layout.jsx**: ChartBox, AnimatedNumber
   - **Metrics.jsx**: HomeKPIs
   - **Charts.jsx**: HomePartyChart, HomeDeptMap, HomeLineChart
   - **Demographics.jsx**: HomeDemoPyramid, HomeTop5
   - Re-exporta todo vía index.js; imports sin cambios
   
3. ✓ **Paso 3** — Verificación de HomeCharts sin D3
   - HomeCharts: ✓ 100% Recharts (sin D3)
   - PageTipos: ⚠️ aún usa D3 (migración posterior)
   - NacionalesBar, GastoComparativo: dead code identificado
   
4. ✓ **Paso 4** — Unificar patrón de control de métrica
   - **Patrón nuevo**: metric como prop externa + onMetricChange callback
   - **Antes**: HomePartyChart, HomeDeptMap, HomeDemoPyramid usaban useState (interno)
   - **Ahora**: Todos aceptan metric prop (parent-driven), como HomeLineChart
   - Actualizado: App.jsx, useFilteredData.js, ComparisonPanel.jsx

**Patrón unificado de control de métrica (post-Paso 4):**

Todos los gráficos ahora usan el mismo patrón: **prop-driven external state**.

```jsx
// Antes (internal state — inconsistente)
export function HomePartyChart({ stats }) {
  const [metric, setMetric] = useState('anuncios')  // ❌ estado local
  // ...
}

// Después (external state — unificado)
export function HomePartyChart({ stats, metric = 'anuncios', onMetricChange }) {
  // ✓ state en parent, props en hijo
  return <button onClick={() => onMetricChange?.('gasto')} />
}

// Parent (App.jsx, ComparisonPanel.jsx)
const [partyMetric, setPartyMetric] = useState('anuncios')
<HomePartyChart metric={partyMetric} onMetricChange={setPartyMetric} />
```

**Ventajas:**
- Componentes sin estado (más testeable, más reutilizable)
- Sincronización entre paneles (PageComparacion): ambos paneles pueden tener métricas independientes
- Patrón consistente en todos los gráficos

**Deuda técnica residual:**
- RegionMap: en uso en DataTable.jsx; migración a Recharts pendiente (futura)
- PageTipos: migración de D3 a Recharts (futura)
- NacionalesBar, GastoComparativo: dead code — evaluar eliminar en próxima iteración
- App.jsx: 669 líneas; PageMetodologia y PageEquipo podrían extraerse (future work)
