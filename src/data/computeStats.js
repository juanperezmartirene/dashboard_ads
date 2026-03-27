// ─── Funciones de agregación sobre TABLE_DATA ────────────────────────────────
// Cada función recibe el array de filas (real o mock) y devuelve datos listos
// para pasar a los componentes de gráficos.

const TIPO_LABELS = {
  advocacy:      'Promoción',
  attack:        'Ataque',
  image:         'Imagen',
  issue:         'Tema',
  call_to_action:'CTA',
  ceremonial:    'Ceremonial',
}

const TIPO_COLORS = {
  advocacy:      '#173363',
  call_to_action:'#0096D1',
  issue:         '#059669',
  image:         '#7C3AED',
  ceremonial:    '#D97706',
  attack:        '#DC2626',
}

const TIPO_KEYS = Object.keys(TIPO_LABELS)

// ─── Distribución de tipos de anuncio (para HorizontalBarChart) ──────────────
// Devuelve [{ tipo, cantidad, pct, color }] ordenado de mayor a menor
export function computeAdTypes(rows) {
  const total = rows.length
  const counts = {}
  TIPO_KEYS.forEach(k => { counts[k] = 0 })
  rows.forEach(row => {
    TIPO_KEYS.forEach(k => { if (row[k] === 1) counts[k]++ })
  })
  return TIPO_KEYS
    .map(k => ({
      tipo:     TIPO_LABELS[k],
      cantidad: counts[k],
      pct:      total > 0 ? +(counts[k] / total * 100).toFixed(1) : 0,
      color:    TIPO_COLORS[k],
    }))
    .sort((a, b) => b.cantidad - a.cantidad)
}

// ─── Distribución por partido (para HorizontalBarChart de partidos) ───────────
// Devuelve [{ partido, anuncios, pct, ...tipoCounts }]
const PARTY_COLORS = {
  'Partido Nacional':  '#1D4ED8',
  'Frente Amplio':     '#DC2626',
  'Partido Colorado':  '#D97706',
  'Otros':             '#6B7280',
}

export function computeParties(rows) {
  const total = rows.length
  const map = {}
  rows.forEach(row => {
    const p = row.part_org || 'Otros'
    if (!map[p]) map[p] = { partido: p, anuncios: 0, color: PARTY_COLORS[p] || '#6B7280' }
    map[p].anuncios++
    TIPO_KEYS.forEach(k => {
      if (!map[p][k]) map[p][k] = 0
      if (row[k] === 1) map[p][k]++
    })
  })
  return Object.values(map).map(d => ({
    ...d,
    pct: total > 0 ? +(d.anuncios / total * 100).toFixed(1) : 0,
  })).sort((a, b) => b.anuncios - a.anuncios)
}

// ─── Distribución por departamento (para DepartmentChart) ────────────────────
// Devuelve [{ departamento, count, pct }]
export function computeDepartamentos(rows) {
  const total = rows.length
  const map = {}
  rows.forEach(row => {
    const d = row.departamento_nacional || 'Nacional'
    map[d] = (map[d] || 0) + 1
  })
  return Object.entries(map)
    .map(([departamento, count]) => ({
      departamento,
      count,
      pct: total > 0 ? +(count / total * 100).toFixed(1) : 0,
    }))
    .sort((a, b) => b.count - a.count)
}

// ─── Distribución demográfica agregada ───────────────────────────────────────
// Promedia demographic_distribution de todas las filas
// Devuelve [{ age, male, female }] para un grouped-bar chart
export function computeDemographics(rows) {
  const agg = {}  // { age: { male: sum, female: sum, n: count } }
  rows.forEach(row => {
    if (!Array.isArray(row.demographic_distribution)) return
    row.demographic_distribution.forEach(({ age, gender, percentage }) => {
      if (!agg[age]) agg[age] = { male: 0, female: 0, n: 0 }
      agg[age][gender] = (agg[age][gender] || 0) + percentage
      if (gender === 'male') agg[age].n++
    })
  })
  return Object.entries(agg)
    .map(([age, v]) => ({
      age,
      male:   v.n > 0 ? +(v.male   / v.n).toFixed(4) : 0,
      female: v.n > 0 ? +(v.female / v.n).toFixed(4) : 0,
    }))
    .sort((a, b) => {
      const order = ['13-17','18-24','25-34','35-44','45-54','55-64','65+']
      return order.indexOf(a.age) - order.indexOf(b.age)
    })
}

// ─── Distribución regional agregada ──────────────────────────────────────────
// Promedia delivery_by_region de todas las filas
// Devuelve [{ region, pct }] ordenado por pct desc
export function computeRegions(rows) {
  const agg = {}
  rows.forEach(row => {
    if (!Array.isArray(row.delivery_by_region)) return
    row.delivery_by_region.forEach(({ region, percentage }) => {
      if (!agg[region]) agg[region] = { sum: 0, n: 0 }
      agg[region].sum += percentage
      agg[region].n++
    })
  })
  return Object.entries(agg)
    .map(([region, v]) => ({
      region,
      pct: v.n > 0 ? +(v.sum / v.n * 100).toFixed(2) : 0,
    }))
    .sort((a, b) => b.pct - a.pct)
}

// ─── Tipología por partido — formato para HeatmapChart ───────────────────────
// HeatmapChart espera [{ nombre, promocion, cta, tema, imagen, ceremonial, ataque }]
const HEATMAP_KEY_MAP = {
  advocacy:       'promocion',
  call_to_action: 'cta',
  issue:          'tema',
  image:          'imagen',
  ceremonial:     'ceremonial',
  attack:         'ataque',
}

export function computeHeatmap(rows) {
  const parties = computeParties(rows)
  return parties.map(p => {
    const partyRows = rows.filter(r => (r.part_org || 'Otros') === p.partido)
    const n = partyRows.length
    const obj = { nombre: p.partido }
    TIPO_KEYS.forEach(k => {
      const cnt = partyRows.filter(r => r[k] === 1).length
      obj[HEATMAP_KEY_MAP[k]] = n > 0 ? +(cnt / n * 100).toFixed(1) : 0
    })
    return obj
  })
}

// ─── Departamentos — formato para DepartmentChart ────────────────────────────
// DepartmentChart espera [{ nombre, impresiones }]
// Mientras no exista columna de impresiones real, usamos count de anuncios
export function computeDepartamentosForChart(rows) {
  return computeDepartamentos(rows)
    .filter(d => d.departamento !== 'Nacional')
    .map(d => ({ nombre: d.departamento, impresiones: d.count }))
}
