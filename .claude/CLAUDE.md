# Dashboard: Publicidad Política en Meta - Uruguay 2024

## Contexto
- **12.096 anuncios** políticos uruguayos, Oct 2023 – Nov 2024
- **Modelo:** ROUBERTa (F1: 0.78), clasificación multi-etiqueta
- **Paper:** Bogliaccini et al. (2025)
- **Audiencia:** Investigadores, académicos, policy makers
- **Estética:** Sobria, minimalista, académica — NO decorativa, NO gradientes

## Stack (decidido y estable)
- React 18 + Vite 5 (JSX, sin TypeScript)
- D3.js (gráficos custom)
- Tailwind CSS 3 + shadcn/ui
- motion (framer-motion) — popup DataTable
- Lucide React — iconos
- clsx + tailwind-merge — utilidad cn()

## Datos
- **Datos reales** en `/public/data/realData.json` y `/public/data/clasificacion.json`
- Procesamiento en `src/data/processRealData.js`
- Media de anuncios servida desde `dashboard/documentos/media/` via plugin Vite

## Constraints de codificación
- Responsive mobile-first
- Accesibilidad: contraste WCAG AA mínimo
- Sin dependencias innecesarias
- Formato numérico: `toLocaleString('es-UY')`

## Archivos de referencia (planificación inicial, pueden estar desactualizados)
- `.claude/data-schema.json` — estructura de datos
- `.claude/design-tokens.css` — paleta, espaciado, tipografía
- `.claude/chart-specs.md` — especificaciones de gráficos
- `.claude/layout.md` — wireframe original

**Nota:** el estado actual del proyecto está en el `CLAUDE.md` raíz, que es la fuente de verdad.
