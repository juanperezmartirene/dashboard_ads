# Especificaciones de Gráficos

## Gráfico 1 — Barras Horizontales (Distribución de Tipos)

**Datos:** `distribucion_tipos[]` de `data-schema.json`

**Spec:**
- Barras horizontales ordenadas descendente por `cantidad`
- Color de cada barra = `color` del dato (consistente en todo el dashboard)
- Etiqueta derecha: `"XX.X% (N anuncios)"`
- Debajo del nombre: F1 score en `--text-xs` y `--color-text-light`
- Tooltip: `Tipo | Cantidad: N | F1: X.XX`
- Sin eje Y visual; sin gridlines verticales

**Herramienta:** Recharts `BarChart` horizontal OR D3 custom

---

## Gráfico 2 — Área Apilada (Evolución Temporal)

**Datos:** `series_temporales[]` — una fila por fecha, columnas por tipo

**Spec:**
- Área apilada normalizada; colores = `--tipo-*` tokens
- Eje X: fechas formato `"MMM YYYY"` (ej: "Oct 2023")
- Eje Y: cantidad de anuncios activos
- **3 líneas verticales punteadas** en fechas de elección:
  - `2024-06-30` — Internas
  - `2024-10-27` — Nacionales
  - `2024-11-24` — Ballottage
- Tooltip: desglose completo por tipo en esa fecha
- Leyenda clickeable: toggle individual de series

**Herramienta:** Recharts `AreaChart` + `Area` OR D3 custom

---

## Gráfico 3 — Heatmap (Partido × Tipo)

**Datos:** `por_partido[]` — campos `promocion`, `ataque`, `tema`, `imagen`, `cta`, `ceremonial` son fracciones (0–1)

**Spec:**
- Filas = Partidos (PN, PC, FA, Otros) | Columnas = 6 tipos
- Escala de color: blanco `#FFFFFF` → `#1F2937` (escala D3 secuencial)
- Texto en celda: porcentaje solo si valor > 5% (evitar saturación)
- Celda: ~80px × 60px
- Tooltip: `Partido | Tipo | X.X% | N anuncios`

**Herramienta:** D3 `rect + text` OR Plotly `Heatmap`

---

## Gráfico 4 — Mapa Coroplético (Impresiones por Departamento)

**Datos:** `distribucion_geografica[]` — campo `impresiones_promedio`

**Spec:**
- 19 departamentos de Uruguay — requiere TopoJSON/GeoJSON
- Escala continua: blanco `#F9FAFB` → azul `#1D4ED8`
- Tooltip: `Departamento | Impresiones: N | % del total`
- Click en departamento → filtra tabla interactiva
- SVG embebido (sin Leaflet) para control total

**GeoJSON:** Buscar `departamentos-uruguay` en GitHub (Natural Earth o AGESIC)

**Herramienta:** D3 + `d3.geoMercator()` + TopoJSON

---

## Tabla Interactiva

**Columnas:**
| # | Campo | Tipo | Notas |
|---|-------|------|-------|
| 1 | Tipo | string | Multiselect filter |
| 2 | Partido | string | Multiselect filter |
| 3 | Etapa | string | Multiselect filter |
| 4 | Territorio | string | Nacional / Montevideo / Interior |
| 5 | Gasto Estimado | string | Rango en USD |
| 6 | Impresiones Promedio | number | Monospace |
| 7 | Combinación | string | Promo Programática, etc. |

**Spec:**
- 100 filas por página con paginación
- Sort en click de header
- Input de filtro en cada header (texto o multiselect)
- Row hover: `background: #F3F4F6`
- Padding por celda: 12px
- Fuente datos: 13px (`--text-sm`), números en `--font-mono`

**Herramienta:** TanStack Table v8 + Tailwind
