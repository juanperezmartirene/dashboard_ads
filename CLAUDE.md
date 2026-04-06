# Dashboard — Publicidad Política Digital en Meta · Uruguay 2024

## Instrucción permanente
**Después de cada cambio funcional, hacer commit + push a `origin/main`.**
Usar mensajes de commit descriptivos en español. Nunca usar `--no-verify`.

---

## Descripción del proyecto
Dashboard académico para visualizar y analizar **12.096 anuncios políticos uruguayos** publicados en Meta (Facebook e Instagram) durante el ciclo electoral 2023–2024. Clasificados automáticamente con el modelo **ROUBERTa (F1: 0,78)** en 6 tipos funcionales (multi-etiqueta).

**Audiencia:** investigadores, académicos, policy makers.
**Propósito:** comunicar hallazgos del paper (Bogliaccini et al., 2025) y permitir exploración interactiva de datos.

---

## Stack técnico
- **React 18 + Vite 5** (JSX, no TypeScript)
- **D3.js** — gráficos custom (barras, heatmap, departamentos)
- **Tailwind CSS 3 + shadcn/ui** — estilos y componentes
- **Lucide React** — iconos
- **motion (framer-motion)** — animaciones popup en DataTable
- **clsx + tailwind-merge** — utilidad `cn()` en `src/lib/utils.js`

### Paleta de colores (no modificar sin consultar)
| Token | Valor | Uso |
|---|---|---|
| Azul UCU oscuro | `#173363` | Header, footer, títulos principales |
| Azul UCU medio | `#1e3d72` | Secundario |
| Celeste acento | `#0096D1` | Botón activo, pills, links |
| Gris fondo | `#F9FAFB` | Background secciones alternas |
| Tipos de anuncio | ver tabla abajo | Consistentes en todos los gráficos |

**Colores por tipo de anuncio:**
- Promoción `#6366F1` · CTA `#3B82F6` · Tema `#10B981`
- Imagen `#F59E0B` · Ceremonial `#8B5CF6` · Ataque `#EF4444`

---

## Estado actual (al 06/04/2026)

### Datos
- **Datos reales** cargados desde `/public/data/realData.json` y `/public/data/clasificacion.json`
- `processRealData.js` limpia, normaliza y agrega los datos (partidos, departamentos, etapas, tipologías)
- Las tipologías ROUBERTa se mergean con `mergeClasificacion()` al cargar
- `mockData.js` y `gastoData.js` existen pero **ya no se usan** en la app principal

### Navegación
SPA por estado (`page` en `App.jsx`), sin router:
| Página | ID | Descripción |
|---|---|---|
| Inicio | `home` | KPIs, filtros globales, tabla de anuncios, departamentos, top cuentas |
| Gastos | `gastos` | Análisis de gasto por partido, internas, nacionales, top cuentas |
| Tipos | `tipos` | Distribución de tipologías ROUBERTa, serie temporal, etapa/partido |
| Metodología | `metodologia` | Descripción del estudio, tipología, corpus |
| Equipo | `equipo` | Integrantes del proyecto |

### Componentes

| Componente | Archivo | Estado |
|---|---|---|
| Header | `Header.jsx` | OK — Sticky, backdrop-blur, Sheet mobile, hero dinámico, anclas por página |
| Footer | `Footer.jsx` | OK — Links, metodología, fuente, referencias |
| FilterPanel | `FilterPanel.jsx` | OK — Filtros por partido, etapa, territorio (afectan Home) |
| DataTable | `DataTable.jsx` | OK — Columnas: página, partido, texto, alcance, tipos, gasto, impresiones. Popup morphing con framer-motion. Link a Meta Ad Library |
| DepartmentChart | `DepartmentChart.jsx` | OK — Barras horizontales por departamento |
| InternasTable | `InternasTable.jsx` | OK — Tabla sorteable internas por precandidato |
| NacionalesBar | `NacionalesBar.jsx` | OK — Barras comparativas nacionales por partido |
| TopCuentas | `TopCuentas.jsx` | OK — Top 5 cuentas por anuncios/gasto/impresiones |
| GastoComparativo | `GastoComparativo.jsx` | OK — Comparativas de gasto |
| PageTipos | `PageTipos.jsx` | OK — Página completa de tipos de anuncios |
| HorizontalBarChart | `HorizontalBarChart.jsx` | Existe, no usado actualmente en layout |
| StackedAreaChart | `StackedAreaChart.jsx` | Existe, no usado actualmente en layout |
| HeatmapChart | `HeatmapChart.jsx` | Existe, no usado actualmente en layout |
| KPICards | `KPICards.jsx` | Archivo existe, no usado |
| MorphingPopover | `MorphingPopover.jsx` | Componente auxiliar para DataTable |

### Procesamiento de datos (`src/data/processRealData.js`)
Funciones de agregación disponibles:
- `processData()` / `mergeClasificacion()` — carga y merge inicial
- `computeGastoMeta/Partido` — gasto por partido con desglose internas/nacionales
- `computeInternasCandidatos` / `computeNacionalesPartidos` — desglose electoral
- `computeTopCuentas` — ranking de cuentas
- `computeDeptDistribution` — impresiones por departamento
- `computeKPIs` / `computeFilteredStats` — métricas generales y filtradas
- `computeTiposTotales/Combinaciones/PorEtapa/PorPartido/PorTerritorio` — tipologías
- `computeGastoImpPorTipo` / `computeSerieTemporal` — gasto e impresiones por tipo

### Pendientes conocidos
1. **Mapa coroplético** — reemplazar `DepartmentChart` con mapa SVG/GeoJSON de Uruguay
2. **Gráficos D3 legacy** — HorizontalBarChart, StackedAreaChart, HeatmapChart existen pero no se usan; evaluar si reintegrarlos o eliminarlos

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
  components/
    Header.jsx          — nav sticky + hero + anclas de sección
    Footer.jsx          — footer con links y referencias
    FilterPanel.jsx     — filtros globales (partido, etapa, territorio)
    DataTable.jsx       — tabla interactiva con popup morphing
    DepartmentChart.jsx — barras por departamento
    InternasTable.jsx   — tabla internas por precandidato
    NacionalesBar.jsx   — barras nacionales
    TopCuentas.jsx      — top 5 cuentas
    GastoComparativo.jsx
    PageTipos.jsx       — página completa de tipos
    MorphingPopover.jsx — popover animado
    HorizontalBarChart.jsx  — (legacy, no usado)
    StackedAreaChart.jsx    — (legacy, no usado)
    HeatmapChart.jsx        — (legacy, no usado)
    KPICards.jsx            — (legacy, no usado)
    ui/                 — componentes shadcn (button, input, table, badge, sheet, select)
  data/
    processRealData.js  — procesamiento y agregación de datos reales
    mockData.js         — datos sintéticos (legacy, no usado)
    gastoData.js        — datos de gasto (legacy, no usado)
public/
  data/
    realData.json       — corpus completo de anuncios
    clasificacion.json  — clasificaciones ROUBERTa
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
