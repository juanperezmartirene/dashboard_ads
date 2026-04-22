# Architectural Foundations & Learnings — Dashboard Publicidad Política Uruguay 2024

**Date:** April 22-24, 2026  
**Context:** Comprehensive architectural review and refactoring of SPA dashboard analyzing 12,096 political advertisements.

---

## Core Architecture Decisions

### 1. SPA Navigation Without Router

**Pattern:** State-based page routing via `page` state in `App.jsx`

```jsx
// App.jsx
const [page, setPage] = useState('home')
return (
  <>
    <Header page={page} onNavigate={setPage} />
    {page === 'home' && <Home />}
    {page === 'comparacion' && <PageComparacion />}
    {page === 'clasificacion' && <PageTipos />}
    ...
  </>
)
```

**Why this approach:**
- No external router dependency (simpler for single-dataset dashboard)
- Direct state control for analytics/debugging (can log all page transitions)
- Avoids URL/history API complexity for academic use case

**Trade-offs:**
- No browser history (back/forward don't work)
- URL doesn't reflect state (can't share specific filtered views)
- Implicit page list (must read App.jsx to discover pages)

**Decision:** Acceptable for publication dashboard. Consider React Router if deep linking becomes required.

---

### 2. Centralized Filter Logic Pattern

**Pattern:** Single source of truth for all filtering operations

**Files:** `src/data/filters.js` (54 lines)

```javascript
export function computeFilteredBase(tableData, {
  selectedParties = [],
  selectedEtapa = 'Todas',
  selectedTerritorio = [],
  selectedDepartamento = 'Todos',
} = {}) {
  let rows = tableData
  if (selectedParties.length > 0) {
    rows = rows.filter(r => selectedParties.includes(r.part_org_normalized))
  }
  // ... territorio, departamento filters follow
  return rows
}
```

**Where used:**
- `useFilteredData.js` — for Comparación and Home pages
- `App.jsx` — for global filtering context

**Why centralize:**
- Eliminates 80+ lines of duplicated filtering logic across 3 locations
- Single place to add new filters (territory, departamento, precandidato)
- Easier to test filter edge cases
- Prevents divergence between pages

**Lesson learned:** Duplicated business logic across components is a red flag for refactoring. Extract to pure functions immediately.

---

### 3. Two-Tier Lazy Loading Strategy

**Tier 1 (Eager):** Loaded on initial page render
- `realData.json` (20MB) — corpus of 12,096 ads
- `clasificacion.json` (1MB) — ROUBERTa classifications

**Tier 2 (Lazy):** Loaded on-demand when needed
- `adDetails.json` (13.6MB) — demographic breakdowns (age/gender per ad)
- `departamentos.geojson` (200KB) — GeoJSON for choropleth map

**Implementation:** Dynamic imports + fetch in useEffect

```javascript
// HomeDemoPyramid.jsx
useEffect(() => {
  if (adDetails) setDemoData(computeAggregateDemographicsWithGasto(filteredTable, adDetails))
}, [filteredTable, adDetails])
```

**Why this split:**
- Core filtering UI needs `realData` immediately
- Demographics/maps are secondary — lazy load saves 13.6MB on page load
- Lazy files only load when user clicks to those sections

**Trade-off:** Slight UX delay when accessing demographics, but much faster initial load.

**Lesson learned:** Profile actual data usage patterns. Don't load everything upfront.

---

### 4. External State Management for Metrics

**Pattern:** Metric state lives in parent, not in chart components

**Post-Paso 4 unification:**

```javascript
// Before (anti-pattern):
function HomePartyChart({ stats }) {
  const [metric, setMetric] = useState('anuncios')  // ❌ local state
}

// After (unified):
function HomePartyChart({ stats, metric = 'anuncios', onMetricChange }) {
  // ✓ parent-driven state
}

// Parent (App.jsx, ComparisonPanel.jsx):
const [partyMetric, setPartyMetric] = useState('anuncios')
<HomePartyChart metric={partyMetric} onMetricChange={setPartyMetric} />
```

**Benefits:**
- Removes component coupling (charts don't manage their own state)
- Enables synchronization across panels (PageComparacion has independent metrics per panel)
- Consistent pattern across all charts
- Easier to debug (single source of metric state)

**Applied to:**
- HomePartyChart (party distribution)
- HomeDeptMap (department distribution)
- HomeDemoPyramid (age/gender demographics)
- HomeLineChart (time series)

**Lesson learned:** Stateless components (prop-driven) scale better. Use parent state as single source of truth.

---

### 5. Component Module Decomposition

**Pattern:** Group semantically related components into modules with barrel exports

**HomeCharts/ module structure:**

```
HomeCharts/
  ├── index.js          # barrel export
  ├── Layout.jsx        # ChartBox, AnimatedNumber primitives
  ├── Metrics.jsx       # HomeKPIs (5 KPIs)
  ├── Charts.jsx        # HomePartyChart, HomeDeptMap, HomeLineChart
  └── Demographics.jsx  # HomeDemoPyramid, HomeTop5
```

**Consumers don't change:**

```javascript
// src/App.jsx
import { HomeKPIs, HomePartyChart, ... } from './components/HomeCharts'
// ✓ same imports despite internal restructuring
```

**Why decompose:**
- HomeCharts.jsx was 800+ lines (unmaintainable)
- Semantic grouping: Metrics, Charts, Demographics are separate concerns
- Each module ~200 lines (reasonable cognitive load)
- Barrel export hides implementation details

**Lesson learned:** Don't let files grow beyond 300-400 lines. Split by semantic boundaries, not by line count.

---

## Design Patterns Applied

### Color Tokenization

**Problem:** 69 hardcoded color values scattered across 11 files

**Solution:** `src/lib/colors.js` — single source of truth

```javascript
export const COLORS = {
  // UCU Branding
  UCU_DARK: '#173363',
  ACENTO_CELESTE: '#0096D1',
  
  // Types (multi-label)
  TIPO_PROMOCION: '#6366F1',
  TIPO_ATAQUE: '#EF4444',
  
  // Parties
  PARTIDO_NACIONAL: '#0EA5E9',
  FRENTE_AMPLIO: '#EAB308',
}

export function getTipoColor(tipoKey) {
  return TIPO_COLORS[tipoKey] || COLORS.GRIS_400
}
```

**Consumption:**

```javascript
// Before: hardcoded
<div style={{ backgroundColor: '#173363' }} />

// After: tokenized
import { COLORS } from '@/lib/colors'
<div style={{ backgroundColor: COLORS.UCU_DARK }} />
```

**Lesson learned:** Define design tokens early. Colors, spacing, typography should never be magic numbers in code.

---

### Memoization Checkpoints

**Pattern:** useMemo at semantic boundaries to prevent cascading recalculations

```javascript
// useFilteredData.js
const filteredBase = useMemo(
  () => computeFilteredBase(tableData, { selectedParties, selectedEtapa, ... }),
  [tableData, selectedParties, selectedEtapa, selectedTerritorio, selectedDepartamento]
)

const deptData = useMemo(() => computeDeptDistribution(filteredTable), [filteredTable])
const filteredStats = useMemo(() => computeFilteredStats(filteredTable), [filteredTable])
const timeSeries = useMemo(() => computeTimeSeries(filteredTable, lineMetric), [filteredTable, lineMetric])
```

**Why this structure:**
- filteredBase is the canonical filtered dataset (memoized once per filter change)
- All downstream computations depend on filteredBase, not the original tableData
- Prevents redundant full-table scans when only metric changes

**Lesson learned:** Identify expensive computations and memoize their inputs. Use dependency arrays as a contract.

---

## Anti-Patterns Identified & Fixed

### ❌ Props Drilling (21 props through 3 layers)

**Before:**
```javascript
// App.jsx → HomeResumen → HomePartyChart (3 hops)
<HomeResumen
  selectedParties={selectedParties}
  selectedEtapa={selectedEtapa}
  selectedTerritorio={selectedTerritorio}
  selectedDepartamento={selectedDepartamento}
  partyMetric={partyMetric}
  setPartyMetric={setPartyMetric}
  deptMetric={deptMetric}
  setDeptMetric={setDeptMetric}
  // ... 13 more props
/>
```

**After:** Extracted to custom hook (useFilteredData)
```javascript
// App.jsx
const { selectedParties, partyMetric, setPartyMetric, ... } = useFilteredData(tableData)

// HomeCharts/Charts.jsx
function HomePartyChart({ stats, metric, onMetricChange }) {
  // Only 3 props needed
}
```

**Result:** 21 props → 3 props. Custom hooks are better than prop drilling for shared state.

---

### ❌ Duplicated Filtering Logic

**Found in:** App.jsx (19 lines), useFilteredData.js (18 lines), processRealData.js (various)

**Fixed:** Extracted to `src/data/filters.js`

```javascript
// Single source of truth
export function computeFilteredBase(tableData, config) { ... }
export function handleEtapaChange(newEtapa, setState, setPrecandidato) { ... }
```

**Lesson learned:** DRY principle applies to business logic too. If you see the same filter logic twice, extract immediately.

---

### ❌ Dead Code Accumulation

**Removed in this refactor:**
- `NacionalesBar.jsx` (D3 legacy, no imports)
- `GastoComparativo.jsx` (D3 legacy, no imports)
- `computeGastoMeta()` (100+ LOC, unused)
- `computeGastoPartido()` (unused)
- `computeTopCuentas()` (unused)
- `computeHeatmapFromReal()` (unused)
- `mockData.js` (legacy fixtures)
- `gastoData.js` (legacy fixtures)

**Total removed:** ~956 lines

**Lesson learned:** Dead code accumulates silently. Audit exports periodically. Use `grep` to verify every export is actually imported.

---

## Performance Optimizations Implemented

### 1. Gzip Compression (vite-plugin-compression)

**Before:**
- realData.json: 20MB (raw)
- adDetails.json: 13.6MB (raw)
- Combined: 33.6MB

**After:**
- realData.json: 3.1MB (gzip)
- adDetails.json: 1.5MB (gzip)
- Combined: 4.6MB → **86% reduction**

**Impact:** Initial page load now downloads 4.6MB instead of 33.6MB (network bound).

---

### 2. Data Layer Centralization

**Problem:** fetch() calls scattered across components (HomeCharts/Charts.jsx line 165)

**Solution:** Move all data fetching to App.jsx, pass via context/props

**Status:** In progress — GeoJSON fetch moved to useEffect with proper error handling.

---

## Security Fixes Applied

### 1. Path Traversal Vulnerability (vite.config.js)

**Before:**
```javascript
const filePath = path.join(mediaRoot, decodeURIComponent(req.url))
```
❌ Vulnerable to `../../etc/passwd` attacks

**After:**
```javascript
const filePath = path.resolve(mediaRoot, decodeURIComponent(req.url).replace(/^\/+/, ''))
if (!filePath.startsWith(mediaRoot)) {
  next()
  return
}
```
✓ Validates path is within mediaRoot

---

### 2. Meta API Token Exposure

**Issue:** realData.json contained access_token parameters in Ad Library URLs

**Fix:** Removed all `?access_token=...` and `&access_token=...` from file before deployment

---

## Remaining Technical Debt

### Tier 1 (High Priority)
- [ ] Virtual scrolling for DataTable (>5K rows)
- [ ] Web Worker for processData/mergeClasificacion (initial paint blocking)
- [ ] Complete data layer migration (centralize all fetch calls)

### Tier 2 (Medium Priority)
- [ ] Migrate PageTipos.jsx from D3 to Recharts (removes 92KB unused bundle)
- [ ] Extract PageMetodologia, PageEquipo to separate files (reduce App.jsx from 685 to ~200 lines)
- [ ] Complete color token migration (69 remaining hardcoded values → imports)

### Tier 3 (Polish)
- [ ] Lazy-load adDetails.json in 100KB chunks by ID range
- [ ] Add React.memo to chart components
- [ ] Consolidate metric state (15 props → 1 metricsState object)
- [ ] Add security headers (CSP, X-Frame-Options) in vercel.json

---

## Key Takeaways

1. **Centralize business logic** — Filters, colors, constants should live in one place
2. **Prefer stateless components** — Props-driven > useState for shared state
3. **Lazy load aggressively** — 13.6MB lazy is better than 13.6MB eager
4. **Audit exports** — Remove dead code quarterly
5. **Extract early, refactor often** — Don't wait for 800-line files to split
6. **Memoization has scope** — Identify expensive operations, memoize inputs at boundaries
7. **Design tokens matter** — Colors, spacing, typography should never be magic numbers

---

## References

- **Custom Hooks:** `src/hooks/useFilteredData.js`
- **Centralized Filters:** `src/data/filters.js`
- **Color Tokens:** `src/lib/colors.js`
- **Component Modules:** `src/components/HomeCharts/`
- **Configuration:** `vite.config.js`, `package.json`
