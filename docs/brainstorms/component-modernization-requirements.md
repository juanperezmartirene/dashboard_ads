# Modernización de Componentes: Refactorización de Charts
**Fecha:** 21 de abril de 2026  
**Estado:** Requerimientos  
**Objetivo:** Componentes prolijos y modulares para construir sosteniblemente

---

## Problema

El proyecto está en desarrollo activo y la arquitectura de componentes necesita ser sólida para escalar. Actualmente:

- **HomeCharts.jsx es monolítico** (400+ líneas, 8 exports): difícil de navegar, modificar o entender independientemente cada gráfico
- **Stack de charts fragmentado**: Recharts (moderno) + D3 (legacy, no usado) + Chart.js (importado pero no usado) → confusión mental
- **Componentes D3 legacy son peso muerto**: 7 componentes (HorizontalBarChart, StackedAreaChart, HeatmapChart, KPICards, DepartmentChart, TopCuentas, RegionMap) sin uso, consumen mantenimiento
- **Difícil agregar gráficos nuevos**: Agregar métrica o gráfico requiere entender todo HomeCharts.jsx y evitar duplicación de lógica

**Impacto en desarrollo:** Onboarding complejo, refactorización riesgosa, falta de claridad en dónde agregar código nuevo.

---

## Visión

Componentes de charts **prolijos, modulares y sostenibles**:
- Cada gráfico vive en su propio archivo (fácil de localizar, entender, modificar)
- Stack de charts unificado (solo Recharts, sin D3 legacy)
- Métrica configurable por spec (datos y lógica separados)
- App.jsx es ligero y fácil de seguir
- Nuevo desarrollador puede agregar un gráfico sin entender toda la arquitectura

---

## Scope: Refactorización en 4 Pasos Secuenciales

Cada paso es **verificable y mergeable por separado**, pero hay dependencias lógicas:
- **Pasos 1 y 3** son independientes entre sí
- **Pasos 2 y 4** son secuencialmente dependientes (Paso 4 requiere que Paso 2 esté completo)

### Paso 1: Eliminar componentes legacy D3
**Entregable:** Borrar 6 componentes no usados  
**Nota:** RegionMap fue excluido porque está en uso activo en DataTable.jsx (línea 385). Migración de DataTable + RegionMap es tarea separada posterior.  
**Archivos a eliminar:**
- `src/components/HorizontalBarChart.jsx`
- `src/components/StackedAreaChart.jsx`
- `src/components/HeatmapChart.jsx`
- `src/components/KPICards.jsx`
- `src/components/DepartmentChart.jsx`
- `src/components/TopCuentas.jsx`

**Acciones:**
1. Verificar que ninguno de estos componentes se importa en ningún archivo (grep en toda la carpeta `src/`)
2. Eliminar los 7 archivos
3. Eliminar cualquier import de D3 que quede sin usar
4. Commit: "Refactor: eliminar componentes D3 legacy no usados"

**Criterio de éxito:** Build y tests pasan; zero regresiones visuales en Home, Comparación, Clasificación

**Duración estimada:** 30 min

---

### Paso 2: Descomponer HomeCharts en 4 módulos semánticos
**Entregable:** 4 archivos modulares agrupados por responsabilidad + `index.js` que re-exporta todo

**Estructura nueva:**
```
src/components/
├── HomeCharts/
│   ├── Layout.jsx            (ChartBox, AnimatedNumber = ~25 líneas)
│   ├── Metrics.jsx           (HomeKPIs = ~80 líneas)
│   ├── Charts.jsx            (HomePartyChart, HomeDeptMap, HomeLineChart = ~330 líneas)
│   ├── Demographics.jsx      (HomeDemoPyramid, HomeTop5 = ~200 líneas)
│   └── index.js              (re-exporta todos)
└── [otros componentes intactos]
```

**Justificación:** 4 archivos agrupados por responsabilidad (layout, metrics, charts, demographics) frente a 8 archivos individuales. Reduce cognitive load: 4 límites semánticos vs 8 puntos de entrada. Cada archivo sigue siendo <330 líneas y fácil de entender.

**Acciones:**
1. Crear directorio `src/components/HomeCharts/`
2. Crear 4 archivos: Layout.jsx, Metrics.jsx, Charts.jsx, Demographics.jsx (agrupar exports por responsabilidad)
3. Para cada archivo, importar sus dependencias (Recharts, motion, utils, etc.)
4. Crear `HomeCharts/index.js` que re-exporte todo: `export { ChartBox, AnimatedNumber, HomeKPIs, ... }`
5. Actualizar imports en App.jsx: `import { HomeKPIs, ... } from './components/HomeCharts'` (verificar que sigue funcionando)
6. Verificar que los imports en otros componentes sigan funcionando (grep para buscar HomeCharts imports)
7. Commit: "Refactor: descomponer HomeCharts en 4 módulos semánticos"

**Criterio de éxito:**
- `npm run build` pasa sin errores
- Tests pasan; zero regresiones visuales (verificar Home y Comparación en navegador)
- Cada archivo es <330 líneas y agrupa componentes relacionados
- Cada módulo puede ser entendido sin leer otros (pero index.js muestra los disponibles)

**Duración estimada:** 1.5-2 horas (incluye testing visual lado a lado)

---

### Paso 3: Verificación de HomeCharts sin D3 (auditar D3 residual)
**Entregable:** Confirmar que HomeCharts no importa D3; documentar componentes D3 activos fuera de HomeCharts

**Auditoría previa (antes de Paso 3):**
- Verificar status de NacionalesBar.jsx y GastoComparativo.jsx: ¿son dead code o stubs para integración?
- Si son dead code: incluir eliminación en Paso 1
- Si son stubs: documentar que están pendientes de integración

**Acciones:**
1. Ejecutar `grep -r "from 'd3'" src/components/ | grep -v HorizontalBarChart | grep -v StackedAreaChart | grep -v HeatmapChart | grep -v KPICards | grep -v DepartmentChart | grep -v TopCuentas`
2. Documentar qué componentes importan D3 (resultado esperado: PageTipos, posiblemente NacionalesBar, GastoComparativo)
3. Confirmar que HomeCharts/ no contiene imports de D3 después de Pasos 1-2
4. Limpiar vite.config.js (líneas 44-45) que crean chunking específico para D3 (ya no necesario)
5. **NO eliminar D3 de package.json** (eso es decisión separada; PageTipos y otros componentes aún lo necesitan)
6. Commit: "Refactor: auditar D3 residual, limpiar vite config"

**Notas:**
- Este paso es una **verificación + auditoría**, no una migración
- **D3 se mantiene en package.json** por ahora (PageTipos y otros lo necesitan)
- **Migración de PageTipos/NacionalesBar a Recharts** es tarea posterior, no en scope de este plan

**Criterio de éxito:**
- `npm run build` pasa sin errores
- HomeCharts/ está confirmadamente sin D3
- Componentes D3 activos (PageTipos, etc.) están documentados en CLAUDE.md como "pendientes de migración"
- vite.config.js está limpio

**Duración estimada:** 30-45 min

---

### Paso 4: Unificar Control de Métrica (elevar a props + documentar pattern)
**Entregable:** Métrica configurable en props; patrón unificado documentado; API actualizada

**Contexto:** Métrica ya es configurable en algunos gráficos (HomeLineChart usa prop `metricKey`; HomeDeptMap usa `useState` interno). Este paso unifica el patrón y documenta decisiones.

**Cambios por componente:**

**HomePartyChart, HomeDeptMap, HomeDemoPyramid:**
- Elevar control de métrica de estado interno a props externas
- Aceptar `metric` prop que App.jsx/ComparisonPanel.jsx pasa explícitamente
- Formato: `<HomePartyChart data={...} metric="gasto" />`

**HomeLineChart:**
- Ya acepta `metricKey` prop; dejar como está O renombrar a `metric` para consistencia

**Ejemplo (HomePartyChart refactorizado):**
```jsx
export function HomePartyChart({ data, metric = 'gasto', onMetricChange }) {
  const metricConfig = {
    gasto: { label: 'Gasto est. (U$S)', format: v => `U$S ${Math.round(v).toLocaleString('es-UY')}` },
    anuncios: { label: 'Anuncios', format: v => Math.round(v).toLocaleString('es-UY') },
    impresiones: { label: 'Impresiones', format: v => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : Math.round(v).toLocaleString('es-UY') },
  }
  if (!(metric in metricConfig)) metric = 'gasto' // fallback si inválida
  const config = metricConfig[metric]
  // ... usar config.label, config.format en el gráfico
}
```

**Acciones:**
1. **Auditar patrón actual:** Verificar qué gráficos controlan métrica internamente vs externamente
2. **Decidir patrón unificado:** Opción A: Todos usan hook `useMetricSelector()` compartido. Opción B: Todos aceptan prop `metric` desde padre. Opción C: Documentar heterogeneidad permitida.
3. **Elevar estado en PartyChart, DeptMap, DemoPyramid:** Mover `useState` → prop `metric`
4. **Actualizar callers:** App.jsx y ComparisonPanel.jsx deben pasar `metric` explícitamente (CAMBIO DE API)
5. **Documentar:** JSDoc en cada componente especificando métricas válidas
6. **Commit:** "Refactor: unificar control de métrica en gráficos"

**⚠️ NOTA IMPORTANTE:** Este paso es un **cambio de API que afecta a App.jsx y ComparisonPanel.jsx**. Requiere actualizar todos los callers.

**Criterio de éxito:**
- Cada gráfico renderiza correctamente con múltiples métricas (validar manualmente)
- Métrica inválida => fallback a default (no crash)
- Patrón documentado en CLAUDE.md: "HomeCharts usan patrón X para métrica"
- Patrón elegido (hook compartido vs prop vs heterogéneo) está documentado
- ComparisonPanel sincroniza métricas entre dos paneles (test: cambiar métrica en panel izq, verificar panel der sigue en sinc)

**Duración estimada:** 2.5-3.5 horas (incluye actualización de callers + testing)

---

## Criterios de Éxito Globales

Después de los 4 pasos, el código debería:

1. **Modular:** 
   - Cada módulo (Layout.jsx, Metrics.jsx, Charts.jsx, Demographics.jsx) puede ser leído independientemente
   - Un nuevo desarrollador puede localizar "dónde están los KPIs" sin preguntar

2. **Limpio:** 
   - HomeCharts/ no importa D3 (grep confirm)
   - 6 componentes legacy eliminados
   - package.json D3 chunking rule eliminado de vite.config.js
   - CLAUDE.md actualizado con nueva estructura

3. **Sostenible:** 
   - Agregar métrica nueva a HomePartyChart: modificar metricConfig + actualizar App.jsx caller (~15 min)
   - Agregar gráfico nuevo: crear archivo en Charts.jsx, agregar export en index.js (~1 hora para gráfico simple)

4. **Documentado:** 
   - Cada export en HomeCharts/ tiene comentario JSDoc con @param (tipo, descripción), @returns, ejemplo
   - Patrón de métrica está documentado en CLAUDE.md: "HomeCharts usan [patrón X]"

5. **Zero regresiones:** 
   - Home page renderiza idénticamente a hoy (verificar screenshot antes/después)
   - Comparación page sincroniza métricas correctamente
   - Clasificación page renderiza igual (nota: aún usa D3, fuera de scope)
   - Cero errores de console en desarrollo

---

## Dependencias y Prerrequisitos

- **No depende de:** Cambios en App.jsx, en hook useFilteredData, en estructura de datos
- **Requiere:** Continuidad en el stack React 18 + Vite 5 + Recharts
- **Nota:** Estos 4 pasos no tocan la lógica de filtros ni datos; solo reorganizan código

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|-----------|
| Romper un gráfico durante Paso 2 | Baja | Alto | Verificar visualmente Home + Comparación lado a lado antes/después; npm run build debe pasar |
| Olvidar import de D3 en Paso 3 | Baja | Bajo | Grep `from 'd3'` en src/components/ (excluir componentes legacy ya eliminados); grep resultado documentado |
| Cambio de API Paso 4 rompe callers | Media | Alto | Actualizar App.jsx + ComparisonPanel.jsx en mismo commit que Paso 4; verificar Home + Comparación renderean correctamente |
| HomeDemoPyramid coupling en Paso 2 | Baja | Alto | Auditar implementación antes de Paso 2; documentar límite (HomeDemoPyramid + DemoPyramid viven juntas) |
| Regresión visual no detectada | Baja | Medio | Screenshot visual: Home antes/después, Comparación antes/después; verificar en navegador, no solo build |
| Merge conflicts entre Pasos 2-4 | Baja | Medio | Pasos 2 y 4 tocan archivos diferentes (Layout.jsx vs imports en App.jsx); riesgo bajo si se hacen en secuencia |

---

## Métricas de Éxito (Verificables)

| Métrica | Medición | Criterio |
| --- | --- | --- |
| **Tamaño de módulos** | Líneas por archivo después Paso 2 | Máximo 330 líneas (Charts.jsx); resto <200 |
| **Comprensibilidad** | Test con 5 devs nuevos: localizar HomeKPIs sin ayuda | ✓ Todos encuentran (Metrics.jsx); ✓ Entienden sin preguntar |
| **Velocidad agregar métrica** | Tiempo: agregar métrica a HomePartyChart (edit → tests en verde) | < 20 min |
| **Impacto de cambio** | Archivos tocados por cambio típico (ej: cambiar color gráfico) | ≤ 2 archivos |
| **Regresión visual** | Screenshot Home + Comparación antes/después | Pixelmente idéntico |
| **Documentación** | % de exports con JSDoc (@param, @returns) | 100% cubierto |

---

## Notas para Implementación

1. **Commits limpios:** Cada paso es un commit atómico con mensaje descriptivo en español. Revertir es fácil si falla.
2. **Después de Paso 1:** Actualizar CLAUDE.md (remover componentes eliminados de tabla)
3. **Después de Paso 2:** 
   - Verificar visualmente Home + Comparación en navegador (antes/después)
   - Ejecutar `npm run build` exitosamente
   - Verificar imports en App.jsx resuelven correctamente
4. **Después de Paso 3:**
   - Documentar en CLAUDE.md qué componentes aún usan D3 (PageTipos, etc.) como "pendientes de migración"
   - Verificar vite.config.js D3 chunking se eliminó
5. **Después de Paso 4:**
   - Verificar ComparisonPanel sincroniza métricas entre paneles
   - Documentar patrón elegido en CLAUDE.md
   - JSDoc en cada export: @param, @returns, ejemplo
6. **Equipo:**
   - Pasos 1 y 3: triviales, 1 persona, 1-1.5 horas total
   - Paso 2: 1.5-2 horas (incluye testing visual)
   - Paso 4: 2.5-3.5 horas (incluye actualización de callers + testing)
   - **Total estimado: 7-8 horas (puede ser 1 persona en 2 días, o 2 personas en paralelo)**
7. **Prerrequisito:** Antes de empezar Paso 1, auditar y decidir status de NacionalesBar + GastoComparativo (¿dead code? ¿stubs?)

---

## Cómo Proceder

**Status actual:** Documento listo para implementación (hallazgos de revisión incorporados)

**Antes de empezar Paso 1:**
- [ ] Auditar: NacionalesBar.jsx + GastoComparativo.jsx (¿dead code o stubs?)
- [ ] Decidir: RegionMap migration (¿tarea separada o excluida de este plan?)
- [ ] Verificar: HomeDemoPyramid no está fuertemente acoplada a DemoPyramid.jsx

**Ejecución:**
- Cada paso es un commit separado. Orden: Paso 1 → Paso 2 → Paso 3 → Paso 4
- Pasos 1 y 3 pueden hacerse en paralelo (independientes)
- Pasos 2 y 4 deben ser secuenciales (4 depende de 2)

**Timeline sugerida:**
- 1 persona: ~8 horas totales (1-2 días)
- 2 personas: Persona A (Pasos 1+3 en paralelo = 2 horas); Persona B (Pasos 2+4 en secuencia = 4-6 horas)

**Siguiente:** Crear tickets/PR para cada paso, asignar, ejecutar
