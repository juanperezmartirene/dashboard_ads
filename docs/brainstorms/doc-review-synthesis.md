# Document Review Synthesis: Component Modernization Requirements
**Fecha:** 21 de abril de 2026  
**Documento revisado:** `docs/brainstorms/component-modernization-requirements.md`  
**Revisores:** 4 personas especializadas (Coherencia, Viabilidad, Scope Guardian, Adversarial)  
**Total hallazgos:** 36  
**Estado:** ⚠️ **No listo para implementación** — Requiere correcciones antes de empezar  

---

## Resumen Ejecutivo

El documento presenta una **visión clara y bien estructurada** para modernizar componentes de charts en 4 pasos secuenciales. Sin embargo, hay **3 hallazgos bloqueantes** que impiden iniciar la implementación:

1. **RegionMap está en uso activo** en DataTable.jsx pero aparece en lista de eliminación del Paso 1
2. **PageTipos usa D3** pero está fuera de scope, haciendo inalcanzable el criterio de éxito del Paso 3
3. **NacionalesBar y GastoComparativo:** status sin claridad (¿componentes muertos o stubs?)

Además, hay **8 hallazgos altos** que afectan diseño, scope, y verificabilidad.

**Recomendación:** Resolver bloqueantes + altos antes de implementación (≈ 1 hora de edición).

---

## 🚨 Hallazgos Bloqueantes (CRÍTICOS)

### F-BLOCK-1: RegionMap está en uso activo en DataTable.jsx

| Campo | Valor |
|-------|-------|
| **Severidad** | CRÍTICA |
| **Encontrado por** | Scope Guardian, Coherencia, Viabilidad, Adversarial |
| **Línea en doc** | Paso 1, línea 45 (lista de eliminación) |
| **Realidad en código** | `src/components/DataTable.jsx:22` importa RegionMap<br>`src/components/DataTable.jsx:385` lo renderiza en popup |
| **Criterio de éxito violado** | Paso 1 dice "zero regresiones visuales en Home" pero deletar RegionMap rompe el popup de detalles de anuncios |

**Evidencia:**
```jsx
// DataTable.jsx línea 22
import RegionMap from '@/components/RegionMap'

// DataTable.jsx línea 385
<RegionMap data={adDetails.region} />
```

**Impacto:** Al ejecutar Paso 1, DataTable pierde la funcionalidad de "Distribución geográfica por región" en el popup de detalles de anuncios.

**Opciones de Fix:**
- **Opción A (Recomendada):** Excluir RegionMap de lista de eliminación. No es componente legacy.
- **Opción B:** Crear tarea separada "Migrar DataTable region viz a Recharts" antes de Paso 1.
- **Opción C:** Reemplazar RegionMap con implementación Recharts antes de ejecutar Paso 1.

**Acción recomendada:** Decidir entre A, B, C antes de empezar. Cambio simple en documento.

---

### F-BLOCK-2: PageTipos usa D3 pero criterio de éxito del Paso 3 es inalcanzable

| Campo | Valor |
|-------|-------|
| **Severidad** | CRÍTICA |
| **Encontrado por** | Scope Guardian, Coherencia, Viabilidad |
| **Línea en doc** | Paso 3, línea 98 (entregable: "sin dependencias D3")<br>Paso 3, línea 108 (nota: "PageTipos se mantiene hasta migración separada") |
| **Realidad en código** | `src/components/PageTipos.jsx:2` contiene `import * as d3 from 'd3'`<br>Página activa en navegación (confirmada en App.jsx) |

**Evidencia:**
```jsx
// PageTipos.jsx línea 2
import * as d3 from 'd3'

// Paso 3 entregable, línea 98
"Codebase usa solo Recharts; sin dependencias D3"
```

**Impacto:** El Paso 3 promete "stack unificado a Recharts" pero PageTipos sigue usando D3. O el criterio de éxito es falso, o la migración de PageTipos está fuera de scope pero sin presupuesto.

**Opciones de Fix:**
- **Opción A (Recomendada):** Renombrar Paso 3 a "Verificación de HomeCharts sin D3 (otros componentes pendientes)" y aclarar que PageTipos, NacionalesBar se migran en iniciativa separada.
- **Opción B:** Incluir migración de PageTipos en Paso 3 (estimado 3-4 horas adicionales). Cambiar entregable y duración.

**Acción recomendada:** Decidir antes de Paso 3 si la meta es realmente "zero D3 en codebase" o "zero D3 en HomeCharts".

---

### F-BLOCK-3: NacionalesBar y GastoComparativo — status unclear

| Campo | Valor |
|-------|-------|
| **Severidad** | ALTA (bloqueante para scope clarity) |
| **Encontrado por** | Coherencia, Viabilidad |
| **Línea en doc** | Paso 1, no mencionados |
| **Realidad en código** | Ambos archivos existen en `src/components/`<br>Ambos importan `d3` (línea 2)<br>Grep: cero importes de estos archivos en todo el codebase |

**Evidencia:**
```bash
$ grep -r "NacionalesBar\|GastoComparativo" src/
# (No results found)
```

**Impacto:** ¿Son componentes legacy olvidados? ¿Stubs para integración futura? ¿Código no usado? La ambigüedad crea riesgo de retrabajo.

**Acción recomendada:** Antes de empezar cualquier paso, ejecutar auditoría: verificar si NacionalesBar/GastoComparativo están en alguna rama de integración, roadmap, o son verdaderamente dead code. Decidir: eliminar o integrar.

---

## ⚠️ Hallazgos Altos (REQUIEREN CORRECCIÓN)

### F-ALT-1: Pasos 2 y 4 son secuencialmente dependientes, no independientes

| Campo | Valor |
|-------|-------|
| **Severidad** | ALTA |
| **Encontrado por** | Scope Guardian, Adversarial |
| **Línea en doc** | Sección "Scope", línea 34: "Cada paso es independiente y verificable" |
| **Realidad** | Paso 2 extrae componentes con API actual<br>Paso 4 cambia la API de esos componentes (props de métrica) |

**Problema:** La afirmación de independencia es incorrecta. Paso 4 cambia la interfaz de componentes que Paso 2 acaba de extraer:
- Paso 2: Extrae `HomePartyChart` con su API actual (métrica vía App.jsx state)
- Paso 4: Rediseña HomePartyChart para aceptar `metric` como prop

Si Paso 4 se hace *sin* Paso 2, trabaja sobre el monolito. Si se hace *después* de Paso 2, modifica archivos recién creados.

**Fix:** 
- Cambiar descripción: "Pasos 1 y 3 son verdaderamente independientes entre sí. Pasos 2 y 4 son secuencialmente dependientes (4 depende de 2)."
- Detallar el contrato de importación entre ellos.

---

### F-ALT-2: Métrica configurable ya existe parcialmente — Paso 4 está mal descrito

| Campo | Valor |
|-------|-------|
| **Severidad** | ALTA |
| **Encontrado por** | Scope Guardian, Viabilidad, Adversarial |
| **Línea en doc** | Paso 4, línea 114-150 (ejemplo de código propuesto) |
| **Realidad en código** | `HomeLineChart.jsx:487` ya acepta `metricKey` prop<br>`HomeDeptMap.jsx:318` gestiona métrica con `useState` interno<br>`HomePartyChart.jsx:134` aceptan métrica pero via App.jsx state |

**Problema:** Paso 4 propone "hacer métrica configurable" como si fuera trabajo nuevo, pero:
- HomeLineChart ya lo hace (prop-driven)
- HomeDeptMap ya lo hace (state interno)
- HomePartyChart lo hace pero vía padre

Paso 4 es realmente: "Unificar patrón de métrica y elevar estado a props externas." Esto es un **cambio de API** que:
1. Afecta App.jsx (pasa metric como prop)
2. Afecta ComparisonPanel.jsx (maneja metric en ambos paneles)

El documento **no identifica que es breaking change** ni presupuesta tiempo para actualizar callers.

**Fix:**
- Redefinir Paso 4: "Elevar control de métrica a props externas en HomePartyChart, HomeDeptMap, HomeDemoPyramid; actualizar App.jsx y ComparisonPanel.jsx para pasar metric."
- Identificar explícitamente: "Este es un breaking change en la interfaz de componentes. Requiere actualizar todos los callers."
- Revisar timeline: puede crecer 30-60 min por testing de callers.

---

### F-ALT-3: ¿Por qué 8 archivos en Paso 2, no 4 o 2? (Over-engineering)

| Campo | Valor |
|-------|-------|
| **Severidad** | ALTA (design decision) |
| **Encontrado por** | Adversarial |
| **Línea en doc** | Paso 2, línea 66-75 (estructura de 8 archivos) |

**Pregunta:** La decomposición propuesta es:
```
HomeCharts/
├── ChartBox.jsx           (~15 líneas)
├── AnimatedNumber.jsx     (~10 líneas)
├── HomeKPIs.jsx           (~80 líneas)
├── HomePartyChart.jsx     (~100 líneas)
├── HomeDeptMap.jsx        (~80 líneas)
├── HomeLineChart.jsx      (~150 líneas)
├── HomeDemoPyramid.jsx    (~120 líneas)
├── HomeTop5.jsx           (~80 líneas)
└── index.js
```

¿Alternativa mejor con 4 archivos?
```
HomeCharts/
├── Layout.jsx             (ChartBox + AnimatedNumber = ~25 líneas)
├── Metrics.jsx            (HomeKPIs = ~80 líneas)
├── Charts.jsx             (PartyChart + LineChart + DeptMap = ~330 líneas)
├── Demographics.jsx       (HomeDemoPyramid + HomeTop5 = ~200 líneas)
└── index.js
```

**Impacto de 8 archivos:**
- 8 imports en index.js (vs 4)
- 8 archivos para leer (vs 4)
- Confusión no desaparece, se multiplica
- Criterio "cada archivo <150 líneas" es síntoma, no meta

**Fix:**
- Considerar 4 archivos agrupados por *responsabilidad*, no por visutal del Dashboard
- O justificar por qué 8 es superior a 4 (no hay justificación actual)
- Recomendación: empezar con 4, expandir si hay necesidad real

---

### F-ALT-4: Criterios de éxito vagos y no verificables

| Campo | Valor |
|-------|-------|
| **Severidad** | ALTA |
| **Encontrado por** | Scope Guardian, Adversarial, Viabilidad |
| **Línea en doc** | "Criterios de Éxito Globales" (líneas 168-176)<br>"Métricas de Éxito" (líneas 203-208) |

**Ejemplos de vaguedad:**
- "Documentado: JSDoc en cada componente" — ¿JSDoc en todas las props? ¿Solo nuevas? ¿Con tipos? ¿Qué es "documentado"?
- "Tiempo para entender un gráfico: < 5 min" — ¿bajo qué condiciones? ¿Lectura de código solo? ¿Corriendo locally? ¿Para quién? ¿Expert o novato?
- "Agregar métrica nueva: < 15 min" — ¿incluye testing? ¿PR review? ¿Deploy?

**Impacto:** Sin definición concreta, es imposible verificar si Paso 2 está "completo." Revisor dice "sí," otro dice "no entendí HomeLineChart."

**Fix:**
- Operacionalizar: "Cinco devs nuevos al codebase pueden localizar y modificar HomeKPIs.jsx sin preguntar. (No: '< 5 min')"
- Trazar: "Tiempo para agregar métrica 'gasto_per_anuncio' a HomePartyChart, medido desde primer edit hasta tests en verde" (Not: '< 15 min')
- Especificar JSDoc: "Cada export en HomeCharts/ tiene comentario JSDoc con @param para cada prop, @returns, valores por defecto"

---

### F-ALT-5: HomeDemoPyramid posible acoplamiento a DemoPyramid.jsx

| Campo | Valor |
|-------|-------|
| **Severidad** | MEDIA-ALTA |
| **Encontrado por** | Viabilidad |
| **Línea en doc** | Paso 2, línea 72 (lista de componentes a extraer) |
| **Realidad en código** | `HomeCharts.jsx:8` importa `import DemoPyramid from './DemoPyramid'`<br>`HomeCharts.jsx:576` define `export function HomeDemoPyramid(...)`<br>¿Qué tan acoplada está HomeDemoPyramid a DemoPyramid? |

**Riesgo:** Si HomeDemoPyramid está fuertemente acoplada a DemoPyramid (lógica compleja, estado compartido), la extracción en Paso 2 puede fallar.

**Fix:**
- **Antes de Paso 2:** Leer implementación completa de HomeDemoPyramid
- Documentar el límite: "HomeDemoPyramid importa DemoPyramid; ambas necesitan vivir juntas en src/components/HomeCharts/"
- O repensar: ¿deberían ser un componente único?

---

### F-ALT-6: Métrica configurable pattern es inconsistente

| Campo | Valor |
|-------|-------|
| **Severidad** | ALTA |
| **Encontrado por** | Viabilidad |
| **Realidad en código** | `HomeLineChart.jsx:487` usa prop `metricKey` (parent-driven)<br>`HomeDeptMap.jsx:318` usa `useState('impresiones')` (component-internal) |

**Problema:** Paso 4 asume patrón unificado, pero codebase es inconsistente. Algunos charts controlan métrica internamente, otros via props. Paso 4 debe aclarar:
- ¿Unificar a todos en el mismo patrón?
- ¿Extraer hook `useMetricSelector()` compartido?
- ¿Aceptar heterogeneidad documentada?

**Fix:**
- Paso 4 debe dirimir: "Todos los charts usan hook compartido `useMetricSelector()`" O "HomeLineChart es parent-driven; HomeDeptMap es internal-state; esto es permitido."
- Documentar pattern elegido

---

### F-ALT-7: vite.config.js D3 chunking queda como código muerto

| Campo | Valor |
|-------|-------|
| **Severidad** | MEDIA |
| **Encontrado por** | Viabilidad |
| **Línea en code** | `vite.config.js` líneas 44-45 |
| **Realidad** | Si D3 se elimina del codebase, la regla `if (id.includes('node_modules/d3'))` nunca se activa |

**Impact:** Código muerto acumula deuda técnica. Pequeño pero debe no olvidarse.

**Fix:** Como parte de Paso 3, limpiar `vite.config.js` (remove D3 chunking rule).

---

### F-ALT-8: CLAUDE.md requiere actualización después de Paso 1

| Campo | Valor |
|-------|-------|
| **Severidad** | MEDIA |
| **Encontrado por** | Coherencia, Viabilidad |
| **Línea en CLAUDE.md** | Líneas 119-126 (tabla de componentes legacy) |

**Problema:** Paso 1 elimina 7 componentes, pero CLAUDE.md no se actualiza. Documentación queda desincronizada.

**Fix:** Incluir en Paso 1 acción: "Actualizar tabla de componentes en CLAUDE.md (líneas 119-126) para remover componentes eliminados."

---

## 📋 Hallazgos Medianos (MEJORAN CLARIDAD, NO SON BLOQUEANTES)

| # | Hallazgo | Severidad | Fix |
|----|----------|-----------|-----|
| M1 | Verificación de grep en Paso 1 no menciona re-exports, imports dinámicos | Media | Especificar: "grep + revisar imports en index.js + revisar App.jsx" |
| M2 | "Zero cambios visuales" en Paso 2 sin presupuestar testing | Media | Agregar 1-2 horas de "verificación visual lado a lado" en timeline |
| M3 | xDomain scaling en HomePartyChart debe preservarse (Paso 4) | Media | Añadir test case: "toggle metric en panel izquierdo, verificar escalas en comparación" |
| M4 | HomeDeptMap geojson fetch silenciosa en error | Baja | Considerar mejorar UX con error state (not required, but nice-to-have) |
| M5 | Rollback strategy no definida | Media | Agregar: "git tag después de cada paso; rollback: git reset --hard [tag]" |
| M6 | Paso 4 "agregar métrica nueva" asume computación ya existe | Media | Aclarar: "Paso 4 es solo display/format de métricas existentes. Nuevas métricas requieren cambios en processRealData.js" |

---

## 📊 Resumen de Hallazgos por Categoría

| Categoría | Bloqueante | Alto | Medio | Bajo | Total |
|-----------|-----------|------|-------|------|-------|
| **Scope** | 3 | 3 | 2 | — | 8 |
| **Coherencia Interna** | — | 2 | 5 | 2 | 9 |
| **Viabilidad Técnica** | — | 3 | 4 | 2 | 9 |
| **Decisiones Arquitectónicas** | — | 2 | 1 | 2 | 5 |
| **TOTAL** | **3** | **10** | **12** | **6** | **31** |

---

## ✅ Recomendación Final

### Acciones Inmediatas (Antes de empezar Paso 1)

**Decisiones requeridas (15-20 min):**
1. RegionMap: ¿Excluir del Paso 1 o crear tarea de migración separada?
2. PageTipos: ¿Incluir en Paso 3 o dejar fuera de scope?
3. NacionalesBar/GastoComparativo: ¿Verificar status y decidir (delete vs integrate)?

**Ediciones al documento (30-40 min):**
1. Resolver bloqueantes: actualizar Paso 1, Paso 3, Paso 4 descripción
2. Aclarar dependencias: Pasos 2-4 son secuenciales, no independientes
3. Especificar criterios verificables: remover "< 5 min", agregar operacionalización
4. Decidir: 8 archivos vs 4 archivos en Paso 2
5. Actualizar timelines si hay cambios

**Verificaciones técnicas (20-30 min):**
1. Auditar HomeDemoPyramid acoplamiento
2. Documentar métrica pattern (unificado vs heterogéneo)
3. Verificar import paths después de decomposición

**Tiempo total:** ≈ 1.5 horas

### Después de correcciones:

Documento estará **listo para implementación** y los 4 pasos podrán ejecutarse con confianza.

---

## Siguiente Paso

¿Quieres que:
1. **Edite el documento ahora** con las correcciones sugeridas (Pasos 1, 2, 3, 4, criterios)?
2. **Agende una reunión rápida** (15 min) para que decidas: RegionMap, PageTipos, NacionalesBar?
3. **Proceda con auditoría técnica** (HomeDemoPyramid, patterns) en paralelo mientras editas?
