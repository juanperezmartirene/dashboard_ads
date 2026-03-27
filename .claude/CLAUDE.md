# Dashboard: Análisis de Publicidad Política en Meta - Uruguay 2024

## Contexto
- **12.096 anuncios** políticos uruguayos, Oct 2023 – Nov 2024
- **Modelo:** ROUBERTa (F1: 0.78)
- **Audiencia:** Investigadores, académicos, policy makers
- **Estética:** Sobria, minimalista, académica — NO decorativa, NO gradientes

## Stack (decidido)
- React 18 + Vite
- D3.js (gráficos custom) + Recharts (alternativa simple)
- Tailwind CSS
- TanStack Table (tabla interactiva)
- D3 + TopoJSON (mapa coroplético)

## Componentes a generar
1. Header con metadatos del estudio
2. Panel de filtros: Partido, Etapa, Territorio, Período (collapse/expand)
3. 4 tarjetas KPI: Total anuncios, Tipo dominante, Partidos, Etapas
4. Gráfico barras horizontales — distribución de tipos
5. Gráfico área apilada — evolución temporal con marcadores electorales
6. Heatmap — Partido × Tipo
7. Mapa coroplético — impresiones por departamento
8. Tabla interactiva — sort + filtro por columna
9. Footer con metodología y fuente

## Constraints de codificación
- Responsive mobile-first (grid 12 cols)
- Accesibilidad: contraste WCAG AA mínimo; SVGs con `<title>` y `<desc>`
- Performance: bundle < 250KB minificado, render < 2s
- Sin dependencias innecesarias
- Datos: JSON estático en `/src/data/` (ver `data-schema.json`)

## Archivos de referencia
- `.claude/data-schema.json` — estructura de datos completa + ejemplo compacto
- `.claude/design-tokens.css` — paleta, espaciado, tipografía
- `.claude/chart-specs.md` — especificaciones detalladas de cada gráfico
- `.claude/layout.md` — wireframe y flujo de trabajo
