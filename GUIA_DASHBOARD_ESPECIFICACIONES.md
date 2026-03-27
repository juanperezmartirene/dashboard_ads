# Guía Práctica: Especificaciones para Dashboard de Análisis de Publicidad Política en Meta

## OBJETIVO
Crear un dashboard académico, sobrio y elegante para visualizar 12.096 anuncios políticos uruguayos clasificados por tipo (advocacy, attack, image, issue, call-to-action, ceremonial) con métricas espaciales y temporales.

**Audiencia:** Investigadores, académicos, policy makers  
**Propósito:** Comunicar hallazgos del paper, permitir exploración de datos  
**Estética:** Sobria, minimalista, blanco/gris/azul corporativo (NO Project Illuminating)  

---

## PARTE 1: ARQUITECTURA DE DATOS

### Formato Principal: JSON Estructurado
Permite máxima flexibilidad, es agnóstico a herramientas, se adapta fácilmente.

```json
{
  "metadata": {
    "total_anuncios": 12096,
    "periodo": "2023-10-01 a 2024-11-30",
    "modelo_clasificacion": "ROUBERTa",
    "f1_score": 0.78,
    "ultima_actualizacion": "2026-03-24"
  },
  "estadisticas_generales": {
    "por_tipo": [
      {"tipo": "Promoción", "cantidad": 10438, "porcentaje": 86.2, "f1": 0.86},
      {"tipo": "Ataque", "cantidad": 1398, "porcentaje": 11.6, "f1": 0.51},
      {"tipo": "Imagen", "cantidad": 3226, "porcentaje": 26.7, "f1": 0.65},
      {"tipo": "Tema", "cantidad": 5782, "porcentaje": 47.8, "f1": 0.76},
      {"tipo": "Llamado a la acción", "cantidad": 7536, "porcentaje": 62.3, "f1": 0.68},
      {"tipo": "Ceremonial", "cantidad": 2131, "porcentaje": 17.6, "f1": 0.75}
    ],
    "por_partido": [
      {"partido": "Frente Amplio", "cantidad": 3150, "promocion": 0.33, "ataque": 0.06, "tema": 0.19, "imagen": 0.07, "cta": 0.25, "ceremonial": 0.05},
      {"partido": "Partido Nacional", "cantidad": 4200, "promocion": 0.35, "ataque": 0.03, "tema": 0.13, "imagen": 0.09, "cta": 0.23, "ceremonial": 0.04},
      {"partido": "Partido Colorado", "cantidad": 3400, "promocion": 0.36, "ataque": 0.04, "tema": 0.17, "imagen": 0.12, "cta": 0.24, "ceremonial": 0.06},
      {"partido": "Otros", "cantidad": 1346, "promocion": 0.34, "ataque": 0.05, "tema": 0.23, "imagen": 0.06, "cta": 0.29, "ceremonial": 0.03}
    ]
  },
  "series_temporales": [
    {"fecha": "2023-10-01", "tipo": "Promoción", "cantidad": 12, "impresiones_promedio": 5000},
    {"fecha": "2023-10-02", "tipo": "Promoción", "cantidad": 15, "impresiones_promedio": 6200},
    // ... continúa hasta 2024-11-30
  ],
  "distribucion_geografica": {
    "por_departamento": [
      {"departamento": "Montevideo", "promocion": 0.42, "ataque": 0.08, "tema": 0.23, "imagen": 0.09, "cta": 0.27, "ceremonial": 0.04},
      {"departamento": "Canelones", "promocion": 0.38, "ataque": 0.05, "tema": 0.20, "imagen": 0.08, "cta": 0.25, "ceremonial": 0.05},
      {"departamento": "Maldonado", "promocion": 0.35, "ataque": 0.04, "tema": 0.19, "imagen": 0.07, "cta": 0.26, "ceremonial": 0.09},
      // ... resto de departamentos
    ]
  },
  "etapas_electorales": [
    {
      "etapa": "Internas",
      "fecha_inicio": "2024-01-01",
      "fecha_fin": "2024-06-30",
      "distribucion_tipos": {
        "promocion": 0.35, "ataque": 0.05, "tema": 0.19, "imagen": 0.08, "cta": 0.23, "ceremonial": 0.05
      },
      "anuncios_total": 6192
    },
    {
      "etapa": "Nacionales",
      "fecha_inicio": "2024-07-01",
      "fecha_fin": "2024-10-31",
      "distribucion_tipos": {
        "promocion": 0.34, "ataque": 0.04, "tema": 0.18, "imagen": 0.10, "cta": 0.27, "ceremonial": 0.06
      },
      "anuncios_total": 5547
    },
    {
      "etapa": "Ballottage",
      "fecha_inicio": "2024-11-01",
      "fecha_fin": "2024-11-30",
      "distribucion_tipos": {
        "promocion": 0.36, "ataque": 0.07, "tema": 0.23, "imagen": 0.11, "cta": 0.16, "ceremonial": 0.11
      },
      "anuncios_total": 357
    }
  ],
  "combinaciones_contenido": [
    {"combinacion": "Promo Programática", "frecuencia": 6000, "porcentaje": 57.4},
    {"combinacion": "Promo Imagen", "frecuencia": 3500, "porcentaje": 33.5},
    {"combinacion": "Ataque Programático", "frecuencia": 1100, "porcentaje": 10.5},
    {"combinacion": "Ataque Imagen", "frecuencia": 50, "porcentaje": 0.5}
  ],
  "metricas_alcance": [
    {
      "tipo": "Promoción",
      "alcance_nacional_porcentaje": 35,
      "alcance_montevideo_porcentaje": 35,
      "alcance_interior_porcentaje": 34
    }
  ]
}
```

**Ventajas:**
- Importa fácil a React, Vue, D3.js, Plotly
- Estructura jerárquica que refleja tu análisis
- Escalable para agregar nuevas dimensiones
- Se puede servir desde API o archivo estático

**Alternativa:** CSV tabulado si prefieres (menos flexible, pero válido)

---

## PARTE 2: STACK TÉCNICO RECOMENDADO (GRATIS)

### Opción A: **REACT + D3.js + Tailwind CSS** ← RECOMENDADA
**Por qué:** Sobriedad máxima, control total, rendimiento excelente, gratis.

| Herramienta | Propósito | Costo | Nivel |
|-------------|-----------|-------|-------|
| **React** | Framework interactivo | Gratis (open source) | Intermedio |
| **D3.js** | Gráficos personalizados | Gratis | Avanzado |
| **Tailwind CSS** | Diseño sobrio minimalista | Gratis | Básico |
| **Recharts** | Gráficos simples (alternativa) | Gratis | Básico |
| **Vite** | Bundler (compilar) | Gratis | Básico |

**Resultado visual:** Limpio, académico, controlable pixel a pixel.

---

### Opción B: **Svelte + Plotly + Tailwind**
**Por qué:** Más ligero que React, Plotly es excelente para análisis, menos boilerplate.

| Herramienta | Propósito | Costo |
|-------------|----------|-------|
| **Svelte** | Framework reactivo | Gratis |
| **Plotly.js** | Gráficos interactivos | Gratis |
| **Tailwind CSS** | Diseño | Gratis |

**Resultado visual:** Similar a Opción A, código más limpio.

---

### Opción C: **HTML + Svelte + Plotly** (Lo que necesitas rápido)
**Por qué:** Tomas tu HTML existente, lo embebés en componentes Svelte, Plotly maneja gráficos.

**Recomendación final:** **Opción A (React + D3 + Tailwind)** = máximo control estético para aspiraciones académicas.

---

## PARTE 3: ESTRUCTURA VISUAL SOBRIA

### **Color Palette (Corporativo Académico)**
```css
--color-primary: #1F2937      /* Gris oscuro para fondos y títulos */
--color-secondary: #374151    /* Gris medio para elementos */
--color-accent: #3B82F6       /* Azul suave para acentos */
--color-accent-alt: #10B981   /* Verde mint para variación */
--color-danger: #EF4444       /* Rojo suave para ataques */
--color-success: #6366F1      /* Índigo para promoción */
--color-bg: #F9FAFB          /* Blanco ligeramente gris */
--color-bg-card: #FFFFFF      /* Blanco puro para tarjetas */
--color-text: #111827         /* Casi negro para texto */
--color-text-light: #6B7280   /* Gris medio para texto secundario */
```

**Lógica:** Colores diferenciados **por función** (no por tipo de anuncio), alineado con literatura de data visualization.

### **Jerarquía de Espaciado (Basada en 8px)**
```
- Título principal: 32px
- Subtítulos: 20px
- Body text: 14px
- Espacios entre secciones: 32px
- Padding interno de cards: 24px
- Gaps entre elementos: 16px
```

### **Tipografía**
```
Títulos: Sans-serif sobria (Inter, Segoe UI, -apple-system)
Body: Misma familia, peso 400
Números (KPIs): Monospace (Courier New) para precisión
```

---

## PARTE 4: LAYOUT DEL DASHBOARD

### **Wireframe (Grid 12 columnas)**

```
┌─────────────────────────────────────────────────────────┐
│ HEADER: "Análisis de Publicidad Política en Meta 2024"  │
│ Período: Oct 2023 - Nov 2024 | Modelo: ROUBERTa F1:0.78│
└─────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬────────────┐
│  KPI 1       │  KPI 2       │  KPI 3       │  KPI 4     │
│ Anuncios     │ Tipo Dominante│ Partidos     │ Etapas     │
│ 12.096       │ Promoción    │ 4            │ 3          │
│              │ (86.2%)      │              │            │
└──────────────┴──────────────┴──────────────┴────────────┘

SECCIÓN FILTROS (Collapse/Expand)
├─ Partido: [Dropdown multiselect]
├─ Etapa: [Tabs: Todas | Internas | Nacionales | Ballottage]
├─ Territorio: [Multiselect: Nacional, Montevideo, Interior]
└─ Período: [Date range picker]

┌─────────────────────────────────────────────────────────┐
│ GRÁFICO 1 (6 cols): Distribución Tipos de Anuncio       │
│ [Gráfico de barras horizontales: Promo, Ataque, etc.]   │
│ Con valores exactos y F1 score de cada categoría         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ GRÁFICO 2 (6 cols): Evolución Temporal por Etapa        │
│ [Gráfico de líneas apiladas, colores por tipo]          │
│ Eje X: Fechas | Eje Y: Cantidad anuncios activos        │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────┬──────────────────────────────┐
│ GRÁFICO 3 (6 cols):      │ GRÁFICO 4 (6 cols):          │
│ Matriz Partido × Tipo    │ Mapa: Impresiones por Dpto.  │
│ [Heatmap]                │ [Coroplético]                │
└──────────────────────────┴──────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ TABLA INTERACTIVA: Detalles de Anuncios                 │
│ Columnas: Tipo | Partido | Etapa | Territorio | Gasto | │
│ Impresiones | Combinación                               │
│ [Sorteable, filtrable]                                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ FOOTER: Metodología | Fuente: Meta Ad Library API       │
│ Última actualización: 24/03/2026                         │
└─────────────────────────────────────────────────────────┘
```

---

## PARTE 5: ESPECIFICACIÓN DE GRÁFICOS

### **Gráfico 1: Distribución de Tipos (Barras Horizontales)**

```
ENTRADA DE DATOS:
[
  {nombre: "Promoción", cantidad: 10438, porcentaje: 86.2, f1: 0.86},
  {nombre: "Ataque", cantidad: 1398, porcentaje: 11.6, f1: 0.51},
  ...
]

ESPECIFICACIÓN:
- Tipo: Barras horizontales (para leer nombres sin rotar)
- Color: Colores diferenciados (no por categoría semántica)
- Ancho barra: Proporcional a cantidad
- Tooltip: Al hover → "Tipo: XXX | Cantidad: YYYY | F1: Z.ZZ"
- Etiqueta derecha: "%XX.X (YYYY anuncios)"
- Orden: Descendente por cantidad
- Nota visual: Indicador de confiabilidad (F1 score) en pequeño debajo del nombre
```

**Herramienta:** D3.js custom OR Recharts (xAxis type="number", yAxis type="category")

---

### **Gráfico 2: Evolución Temporal (Área Apilada)**

```
ENTRADA DE DATOS:
[
  {fecha: "2023-10-01", Promoción: 12, Ataque: 2, Imagen: 5, Tema: 8, CTA: 10, Ceremonial: 3},
  {fecha: "2023-10-02", Promoción: 15, Ataque: 1, Imagen: 6, ...},
  ...
]

ESPECIFICACIÓN:
- Tipo: Gráfico de área apilada (mostrar composición + tendencia)
- Eje X: Fechas (formato: MMM YYYY)
- Eje Y: Cantidad anuncios activos
- Colores: Cada tipo su propio color (consistente con Gráfico 1)
- Tooltip: Desglose por tipo en esa fecha
- Líneas verticales: Marcar fechas de elecciones (30 Jun = Internas, 27 Oct = Nacionales, 24 Nov = Ballottage)
- Interactividad: Hover muestra detalles; click en leyenda togglea series
```

**Herramienta:** D3.js custom OR Recharts (AreaChart + AreaChart.Area)

---

### **Gráfico 3: Heatmap Partido × Tipo**

```
ENTRADA DE DATOS:
[
  {partido: "Frente Amplio", tipo: "Promoción", porcentaje: 33},
  {partido: "Frente Amplio", tipo: "Ataque", porcentaje: 6},
  ...
]

ESPECIFICACIÓN:
- Matriz: Filas = Partidos (FA, PN, PC, Otros) | Columnas = Tipos (Promo, Ataque, Imagen, Tema, CTA, Ceremonial)
- Color: Escala de intensidad (blanco = 0%, gris oscuro = max %)
- Texto: Porcentaje en cada celda (solo si > 5% para no saturar)
- Tooltip: Partido | Tipo | Porcentaje | Cantidad anuncios
- Tamaño: Cada celda ~80px × 60px
```

**Herramienta:** D3.js custom (rect + text) OR Plotly.js (Heatmap)

---

### **Gráfico 4: Mapa Coroplético (Impresiones por Dpto)**

```
ENTRADA DE DATOS:
[
  {departamento: "Montevideo", impresiones_promedio: 542000, porcentaje_total: 45},
  {departamento: "Canelones", impresiones_promedio: 187000, porcentaje_total: 16},
  ...
]

ESPECIFICACIÓN:
- Mapa: Contornos de 19 departamentos de Uruguay
- Color: Escala continua (blanco = pocos, azul oscuro = muchos)
- Tooltip: Dpto | Impresiones | Porcentaje del total
- Interactividad: Click en dpto → filtra tabla a esos datos
- Nota: SVG embebido (no herramienta de mapas, para control total)
```

**Herramienta:** D3.js + TopoJSON de Uruguay OR Leaflet + GeoJSON

---

### **Tabla Interactiva**

```
COLUMNAS:
1. Tipo (Promo, Ataque, etc.)
2. Partido
3. Etapa (Internas, Nacionales, Ballottage)
4. Territorio (Nacional, Montevideo, Interior)
5. Gasto Estimado (USD, rango)
6. Impresiones Promedio
7. Combinación (Promo Programática, Ataque Imagen, etc.)

ESPECIFICACIÓN:
- Filas: 100 por página (scroll infinito o paginación)
- Sorteo: Click en header
- Filtrado: Inputs en header de cada columna (texto/multiselect)
- Resaltado: Row hover = background gris suave
- Densidad: Spacing compacto pero legible (padding 12px)
- Tipografía: Body 13px para datos, números en monospace
```

**Herramienta:** React Table (TanStack Table) + Tailwind

---

## PARTE 6: INSTRUCCIONES PARA CLAUDE

### **Si quiero que generes el código, especifica:**

#### **PROMPT TEMPLATE:**

```
Necesito que generes un dashboard académico sobrio basado en estos parámetros:

DATOS:
- Formato: JSON [adjuntar JSON con estructura de arriba]
- Período: Oct 2023 - Nov 2024
- Total anuncios: 12.096
- Partidos: 4 (FA, PN, PC, Otros)
- Tipos de anuncio: 6 (Promoción, Ataque, Imagen, Tema, CTA, Ceremonial)

STACK TÉCNICO:
- Frontend: React 18 + Vite
- Gráficos: D3.js [OR Recharts OR Plotly]
- Estilos: Tailwind CSS
- Mapa: [Leaflet OR D3 custom]

REQUISITOS VISUALES:
- Paleta: Grises #1F2937 a #F9FAFB, azul #3B82F6, rojo #EF4444 para ataques
- Layout: 12 columnas, responsive
- Sobriedad: Sin gradientes, sin decoración, sólo funcionali

dad

COMPONENTES A GENERAR:
1. [X] Header con metadatos
2. [X] Panel de filtros (Partido, Etapa, Territorio, Período)
3. [X] 4 tarjetas KPI (Total, Tipo Dominante, Partidos, Etapas)
4. [X] Gráfico barras horizontales (distribución tipos)
5. [X] Gráfico área apilada (evolución temporal)
6. [X] Heatmap (Partido × Tipo)
7. [X] Mapa coroplético (impresiones por dpto)
8. [X] Tabla interactiva con sort/filtro
9. [X] Footer con metodología

INSTRUCCIONES ADICIONALES:
- Responsivo (mobile-first)
- Accesibilidad: contraste WCAG AA mínimo
- Performance: <2s en conexión lenta
- Sin dependencias innecesarias
```

---

## PARTE 7: FLUJO DE TRABAJO RECOMENDADO

### **Fase 1: Preparación de Datos (TÚ)**
1. Exporta datos del modelo BERT a CSV/JSON usando Python o R
2. Valida estructura usando el JSON template de arriba
3. Genera subconjuntos para testing (100-1000 anuncios para prototipo rápido)
4. Documenta cualquier transformación (ej: cómo se calculan proporciones)

### **Fase 2: Prototipo Estático (CLAUDE)**
1. Instrucción inicial: genera HTML + CSS con estructura de wireframe
2. Usa datos hardcodeados (JSON literal en JavaScript)
3. Sin reactividad, solo visualización
4. Objetivo: validar diseño visual

### **Fase 3: Interactividad (CLAUDE o TÚ)**
1. Agregá filtros (dropdowns, toggles)
2. Integración con gráficos (seleccionar partido → filtra todos)
3. Prueba performance con datos reales

### **Fase 4: Pulir (TÚ)**
1. Ajusta colores según comentarios
2. Agrega tooltips y leyendas
3. Optimiza para impresión (PDF export)

---

## PARTE 8: EJEMPLO DE JSON COMPACTO (para que empieces rápido)

```json
{
  "titulo": "Análisis de Publicidad Política en Meta - Uruguay 2024",
  "periodo": "Oct 2023 - Nov 2024",
  "modelo": "ROUBERTa (F1: 0.78)",
  "kpis": {
    "total_anuncios": 12096,
    "tipo_dominante": "Promoción (86.2%)",
    "partidos": 4,
    "etapas": 3
  },
  "distribucion_tipos": [
    {"tipo": "Promoción", "cantidad": 10438, "pct": 86.2, "f1": 0.86, "color": "#6366F1"},
    {"tipo": "CTA", "cantidad": 7536, "pct": 62.3, "f1": 0.68, "color": "#3B82F6"},
    {"tipo": "Tema", "cantidad": 5782, "pct": 47.8, "f1": 0.76, "color": "#10B981"},
    {"tipo": "Imagen", "cantidad": 3226, "pct": 26.7, "f1": 0.65, "color": "#F59E0B"},
    {"tipo": "Ceremonial", "cantidad": 2131, "pct": 17.6, "f1": 0.75, "color": "#8B5CF6"},
    {"tipo": "Ataque", "cantidad": 1398, "pct": 11.6, "f1": 0.51, "color": "#EF4444"}
  ],
  "por_partido": [
    {"nombre": "Frente Amplio", "cantidad": 3150, "pct": 26},
    {"nombre": "Partido Nacional", "cantidad": 4200, "pct": 35},
    {"nombre": "Partido Colorado", "cantidad": 3400, "pct": 28},
    {"nombre": "Otros", "cantidad": 1346, "pct": 11}
  ],
  "etapas": [
    {"nombre": "Internas", "fecha": "Jun 2024", "cantidad": 6192},
    {"nombre": "Nacionales", "fecha": "Oct 2024", "cantidad": 5547},
    {"nombre": "Ballottage", "fecha": "Nov 2024", "cantidad": 357}
  ]
}
```

---

## PARTE 9: CHECKLIST ANTES DE DAR INSTRUCCIONES A CLAUDE

- [ ] Tengo JSON con datos reales (o datos de ejemplo representativos)
- [ ] Definí paleta de colores (copiar de arriba o personalizar)
- [ ] Tengo claro el público (académicos → explicar metodología + fuentes)
- [ ] Decido stack: React vs Svelte vs HTML puro
- [ ] Tengo archivo SVG o GeoJSON del mapa de Uruguay (buscar en GitHub)
- [ ] Defino qué filtros son CRÍTICOS vs NICE-TO-HAVE
- [ ] Decido si necesito exportar a PDF o es solo web
- [ ] Defino si es ONE-PAGE o MULTI-TAB

---

## PARTE 10: REFERENCIAS DE CÓDIGO ABIERTO PARA COPIAR

### Mapas de Uruguay (GeoJSON/TopoJSON)
- **OpenStreetMap Data:** https://www.openstreetmap.org/
- **Natural Earth (datos cartográficos):** https://www.naturalearthdata.com/
- **Uruguay shapefiles en GitHub:** Busca `uruguayan-geojson` o `departamentos-uruguay`

### Temas Tailwind Sobrios
- **Tailwind UI Presets:** Busca `tailwind-config.js` con paleta gris + azul
- **Shadcn/ui:** Componentes React + Tailwind preconstruidos

### Librerías D3 con templates
- **Observable:** https://observablehq.com/ (galerías de gráficos D3)
- **D3 Gallery:** https://d3-graph-gallery.com/

---

## RESUMEN: TU PRÓXIMO PASO

1. **Prepara JSON** con tus datos reales (puedo ayudarte a transformar de R/Python)
2. **Decide stack:** Recomiendo React + D3 + Tailwind
3. **Elige primero que genere:** Prototipo HTML estático o ya con componentes React
4. **Pasa esta guía + JSON a Claude** con el prompt template de arriba

**Prompt final corto:**

```
Usá esta guía práctica [ADJUNTAR ESTE DOCUMENTO] 
con estos datos [ADJUNTAR JSON]
para generar un dashboard React + D3 + Tailwind CSS 
que sea sobrio, académico, y se vea completamente distinto a Project Illuminating.

Enfoque en el wireframe de la PARTE 4 y especificaciones de gráficos de PARTE 5.
```

---

## NOTAS TÉCNICAS FINALES

- **Bundle size:** React + D3 + Tailwind = ~250KB minificado (aceptable)
- **SEO:** No necesario (es dashboard privado), pero agrega meta tags igual
- **Offline:** Guarda datos en JSON estático dentro del proyecto
- **Accesibilidad:** Todos los gráficos con `<title>` y `<desc>` en SVG
- **Print:** Añade media query CSS `@media print { }` para no imprimir filtros

