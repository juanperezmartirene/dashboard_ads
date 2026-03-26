# Dashboard — Publicidad Política Digital en Meta · Uruguay 2024

## Instrucción permanente
**Después de cada cambio funcional, hacer commit + push a `origin/main`.**
Usar mensajes de commit descriptivos en español. Nunca usar `--no-verify`.

---

## Descripción del proyecto
Dashboard académico para visualizar y analizar **12.096 anuncios políticos uruguayos** publicados en Meta (Facebook e Instagram) durante el ciclo electoral 2023–2024. Clasificados automáticamente con el modelo **ROUBERTa (F1: 0,78)** en 6 tipos funcionales.

**Audiencia:** investigadores, académicos, policy makers.
**Propósito:** comunicar hallazgos del paper y permitir exploración interactiva de datos.

---

## Stack técnico
- **React 18 + Vite** (JSX, no TypeScript)
- **D3.js** — todos los gráficos
- **Tailwind CSS + shadcn/ui** — estilos y componentes
- **Lucide React** — iconos

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

## Estado actual (al 26/03/2026)

### Páginas
El app tiene navegación SPA por estado (`page` en `App.jsx`), sin router:
- **Inicio** (`home`) — gráficos y exploración de datos
- **Metodología** (`metodologia`) — descripción del estudio, tipología, corpus
- **Equipo** (`equipo`) — integrantes

### Componentes y su estado

| Componente | Archivo | Estado |
|---|---|---|
| Header | `Header.jsx` | ✅ Sticky, backdrop-blur, Sheet mobile, logo + nav |
| FilterPanel | `FilterPanel.jsx` | ✅ Filtros por partido, etapa, territorio |
| HorizontalBarChart | `HorizontalBarChart.jsx` | ✅ D3, tooltips, F1 score |
| StackedAreaChart | `StackedAreaChart.jsx` | ✅ D3, leyenda interactiva, marcadores electorales |
| HeatmapChart | `HeatmapChart.jsx` | ✅ D3, escala de azules, leyenda |
| DepartmentChart | `DepartmentChart.jsx` | ⚠️ Barras horizontales — falta mapa coroplético |
| DataTable | `DataTable.jsx` | ✅ Columnas: Nombre de página, Partido, Texto, Alcance, Tipos, Gasto, Impresiones |
| Footer | `Footer.jsx` | ✅ |
| KPICards | `KPICards.jsx` | ❌ Eliminado del layout (archivo existe pero no se usa) |

### Datos
- **Todos los datos son sintéticos** (mock) en `src/data/mockData.js`
- Los datos reales (ROUBERTa output) aún no están disponibles
- Cuando lleguen los datos reales, reemplazar `mockData.js` y ajustar los campos de `TABLE_DATA` para que coincidan con las columnas de `DataTable`

### Pendientes conocidos
1. **Mapa coroplético** — reemplazar `DepartmentChart` con mapa SVG/GeoJSON de Uruguay por departamentos
2. **Datos reales** — conectar JSON/CSV del modelo cuando estén listos
3. **GeoJSON Uruguay** — buscar en GitHub (`uruguayan-geojson` o `departamentos-uruguay`)

---

## Estructura de archivos relevante
```
src/
  App.jsx               — layout principal, navegación, filtros globales
  index.css             — estilos base, paleta, font-size 106.25%
  components/
    Header.jsx
    Footer.jsx
    FilterPanel.jsx
    KPICards.jsx        — no usado actualmente
    HorizontalBarChart.jsx
    StackedAreaChart.jsx
    HeatmapChart.jsx
    DepartmentChart.jsx
    DataTable.jsx
    ui/                 — componentes shadcn (button, input, table, badge, sheet, select...)
  data/
    mockData.js         — todos los datos sintéticos
```

---

## Convenciones
- Textos en **español (Uruguay)**: separador decimal coma, miles punto (`toLocaleString('es-UY')`)
- No usar TypeScript — el proyecto es JSX puro
- No agregar dependencias sin necesidad concreta
- Estética: sobria, minimalista, académica. Sin gradientes decorativos, sin animaciones innecesarias
