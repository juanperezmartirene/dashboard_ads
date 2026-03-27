# Layout del Dashboard

## Wireframe (Grid 12 columnas)

```
┌─────────────────────────────────────────────────────────┐
│ HEADER                                                  │
│ "Análisis de Publicidad Política en Meta 2024"          │
│ Período: Oct 2023 – Nov 2024 | ROUBERTa F1: 0.78       │
└─────────────────────────────────────────────────────────┘

┌──────────┬──────────┬──────────┬──────────────────────┐
│  KPI 1   │  KPI 2   │  KPI 3   │  KPI 4               │
│ 12.096   │Promoción │    4     │    3                  │
│ anuncios │ (86.2%)  │ partidos │  etapas               │
└──────────┴──────────┴──────────┴──────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ FILTROS [collapse/expand]                               │
│ Partido: [multiselect] | Etapa: [tabs] | Territorio: [ ]│
│ Período: [date range picker]                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Gráfico 1 (12 cols): Distribución de Tipos              │
│ [Barras horizontales ordenadas desc]                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Gráfico 2 (12 cols): Evolución Temporal                 │
│ [Área apilada con marcadores electorales]               │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────┬──────────────────────────────┐
│ Gráfico 3 (6 cols)       │ Gráfico 4 (6 cols)           │
│ Heatmap Partido × Tipo   │ Mapa coroplético Uruguay     │
└──────────────────────────┴──────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Tabla Interactiva                                       │
│ Tipo | Partido | Etapa | Territorio | Gasto | Impr. | … │
│ [Sort + filtro por columna | 100 filas/página]          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ FOOTER                                                  │
│ Metodología | Fuente: Meta Ad Library API               │
│ Última actualización: 24/03/2026                        │
└─────────────────────────────────────────────────────────┘
```

## Estructura de Componentes React

```
src/
├── data/
│   └── dashboard-data.json       ← copiar de .claude/data-schema.json
├── components/
│   ├── Header.jsx
│   ├── KPICards.jsx
│   ├── FiltersPanel.jsx
│   ├── charts/
│   │   ├── BarChartTipos.jsx     ← Gráfico 1
│   │   ├── AreaChartTemporal.jsx ← Gráfico 2
│   │   ├── HeatmapPartido.jsx    ← Gráfico 3
│   │   └── MapaDepartamentos.jsx ← Gráfico 4
│   ├── TablaInteractiva.jsx
│   └── Footer.jsx
├── hooks/
│   └── useFilters.js             ← estado global de filtros
├── App.jsx
└── index.css                     ← importar design-tokens.css
```

## Flujo de Filtros

```
FiltersPanel (estado en App.jsx o Context)
    ↓ filtra datos
KPICards + Gráfico1 + Gráfico2 + Gráfico3 + TablaInteractiva

MapaDepartamentos → click en dpto → agrega filtro territorio → Tabla
```

## Fases de desarrollo

1. **Estático:** HTML + datos hardcodeados, validar diseño visual
2. **Gráficos:** Integrar D3/Recharts con datos reales
3. **Filtros:** Conectar filtros → re-renderizado de todos los componentes
4. **Pulir:** Tooltips, leyendas, print CSS, a11y
