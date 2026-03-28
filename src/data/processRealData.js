// ─── Procesamiento de datos reales ──────────────────────────────────────────
// Limpia, mapea y agrega los datos cargados desde realData.json

// ─── Mapeo de abreviaciones de departamentos ────────────────────────────────
const DEPTO_MAP = {
  AR: 'Artigas',
  CA: 'Canelones',
  CL: 'Cerro Largo',
  CO: 'Colonia',
  DU: 'Durazno',
  FD: 'Florida',
  FS: 'Flores',
  LA: 'Lavalleja',
  MA: 'Maldonado',
  MO: 'Montevideo',
  PA: 'Paysandú',
  RN: 'Río Negro',
  RO: 'Rocha',
  RV: 'Rivera',
  SA: 'Salto',
  SJ: 'San José',
  SO: 'Soriano',
  TA: 'Tacuarembó',
  TT: 'Treinta y Tres',
}

// ─── Limpieza de texto ──────────────────────────────────────────────────────
function cleanText(text) {
  if (!text) return text
  let t = String(text)
  // Remove _x000D_ (Excel carriage return artifact)
  t = t.replace(/_x000D_/g, '')
  // Remove leading ['...'] pattern (body text wrapped in Python list notation)
  t = t.replace(/^\s*\[['"]/, '').replace(/['"]\]\s*/, ' ')
  // Remove remaining square brackets
  t = t.replace(/[\[\]]/g, '')
  // Remove single quotes at start/end of text
  t = t.replace(/^'+|'+$/g, '')
  // Collapse multiple newlines into one
  t = t.replace(/\n{3,}/g, '\n\n')
  // Collapse multiple spaces
  t = t.replace(/ {2,}/g, ' ')
  return t.trim()
}

// ─── Normalizar nombre de partido ───────────────────────────────────────────
function normalizePartido(p) {
  if (!p) return 'Otros'
  if (p === 'Frente Amplio' || p === 'Partido Nacional' || p === 'Partido Colorado') return p
  return 'Otros'
}

// ─── Determinar etapa a partir de tipo_eleccion ─────────────────────────────
function normalizeEtapa(te) {
  if (!te) return null
  const lower = te.toLowerCase()
  if (lower === 'internas') return 'Internas'
  if (lower === 'nacionales') return 'Nacionales'
  if (lower === 'balotaje' || lower === 'ballottage') return 'Ballottage'
  return te
}

// ─── Procesar un registro individual ────────────────────────────────────────
function processRow(row) {
  // Compute midpoints from bounds when promedio fields are null/missing
  // When upper bound is null (open-ended range like "1M+"), use lower bound only
  const imp = row.promedio_impresiones != null
    ? row.promedio_impresiones
    : row.impressions_low != null
      ? row.impressions_upp != null
        ? (row.impressions_low + row.impressions_upp) / 2
        : row.impressions_low
      : 0
  const gasto = row.promedio_gasto != null
    ? row.promedio_gasto
    : row.spend_lower != null
      ? row.spend_upper != null
        ? (row.spend_lower + row.spend_upper) / 2
        : row.spend_lower
      : 0

  return {
    ...row,
    promedio_impresiones: imp,
    promedio_gasto: gasto,
    departamento_nacional: DEPTO_MAP[row.departamento_nacional] || row.departamento_nacional || 'Nacional',
    departamento_code: row.departamento_nacional, // keep original code
    text_body: cleanText(row.text_body),
    texto_anuncio_completo: cleanText(row.texto_anuncio_completo),
    part_org_normalized: normalizePartido(row.part_org),
    etapa: normalizeEtapa(row.tipo_eleccion),
    // Campos que DataTable espera (compatibilidad mock → real)
    _gasto: gasto > 0 ? `U$S ${Math.round(gasto).toLocaleString('es-UY')}` : '—',
    _impresiones: Math.round(imp),
  }
}

// ─── Procesar todo el dataset ───────────────────────────────────────────────
export function processData(raw) {
  return raw.map(processRow)
}

// ─── Colores por partido ────────────────────────────────────────────────────
const PARTY_COLORS = {
  'Partido Nacional': '#1D4ED8',
  'Frente Amplio':    '#DC2626',
  'Partido Colorado': '#D97706',
  'Otros':            '#6B7280',
}

// ─── Computar gastos para la página Gastos ──────────────────────────────────

export function computeGastoMeta(rows) {
  const internas = rows.filter(r => r.etapa === 'Internas')
  const nacionales = rows.filter(r => r.etapa === 'Nacionales')
  const ballottage = rows.filter(r => r.etapa === 'Ballottage')

  const sum = (arr, field) => arr.reduce((s, r) => s + (Number(r[field]) || 0), 0)

  return {
    total_anuncios:      rows.length,
    anuncios_internas:   internas.length,
    anuncios_nacionales: nacionales.length,
    anuncios_ballottage: ballottage.length,
    gasto_total:         Math.round(sum(rows, 'promedio_gasto')),
    gasto_internas:      Math.round(sum(internas, 'promedio_gasto')),
    gasto_nacionales:    Math.round(sum(nacionales, 'promedio_gasto')),
    imp_total:           Math.round(sum(rows, 'promedio_impresiones')),
    imp_internas:        Math.round(sum(internas, 'promedio_impresiones')),
    imp_nacionales:      Math.round(sum(nacionales, 'promedio_impresiones')),
    cuentas_internas:    new Set(internas.map(r => r.page_id).filter(Boolean)).size,
    cuentas_nacionales:  new Set(nacionales.map(r => r.page_id).filter(Boolean)).size,
  }
}

export function computeGastoPartido(rows) {
  const parties = ['Partido Nacional', 'Frente Amplio', 'Partido Colorado']
  return parties.map(p => {
    const all = rows.filter(r => r.part_org === p)
    const int = all.filter(r => r.etapa === 'Internas')
    const nac = all.filter(r => r.etapa === 'Nacionales')
    const sum = (arr, f) => arr.reduce((s, r) => s + (Number(r[f]) || 0), 0)
    return {
      partido: p,
      short: p === 'Partido Nacional' ? 'PN' : p === 'Frente Amplio' ? 'FA' : 'PC',
      color: PARTY_COLORS[p],
      anuncios: all.length,
      anuncios_internas: int.length,
      anuncios_nacionales: nac.length,
      gasto_total: Math.round(sum(all, 'promedio_gasto')),
      gasto_internas: Math.round(sum(int, 'promedio_gasto')),
      gasto_nacionales: Math.round(sum(nac, 'promedio_gasto')),
      imp_total: Math.round(sum(all, 'promedio_impresiones')),
      imp_internas: Math.round(sum(int, 'promedio_impresiones')),
      imp_nacionales: Math.round(sum(nac, 'promedio_impresiones')),
    }
  })
}

export function computeInternasCandidatos(rows) {
  const internas = rows.filter(r => r.etapa === 'Internas')
  const parties = ['Partido Nacional', 'Frente Amplio', 'Partido Colorado', 'Otros']

  return parties.map(p => {
    const partyRows = internas.filter(r => r.part_org_normalized === p)
    const sum = (arr, f) => arr.reduce((s, r) => s + (Number(r[f]) || 0), 0)

    // Group by pre_pres (candidate)
    const candMap = {}
    partyRows.forEach(r => {
      // Skip rows where pre_pres is a stage name or party name
      const cand = r.pre_pres
      if (!cand || cand === 'Nacionales' || cand === 'Internas' || cand === 'Plebiscito'
          || cand === 'Plebiscito de seguridad'
          || cand === 'Partido Nacional' || cand === 'Frente Amplio' || cand === 'Partido Colorado') {
        const key = `Otros ${p === 'Otros' ? '' : p.split(' ').map(w => w[0]).join('')}`.trim()
        if (!candMap[key]) candMap[key] = []
        candMap[key].push(r)
        return
      }
      // Format name: "LASTNAME, Firstname" → "Firstname Lastname"
      let name = cand
      if (cand.includes(',')) {
        const parts = cand.split(',').map(s => s.trim())
        const last = parts[0].split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
        const first = parts[1].split(' ')[0]
        name = `${first} ${last}`
      }
      if (!candMap[name]) candMap[name] = []
      candMap[name].push(r)
    })

    const candidatos = Object.entries(candMap)
      .map(([nombre, cRows]) => ({
        nombre,
        anuncios: cRows.length,
        impresiones: Math.round(sum(cRows, 'promedio_impresiones')),
        gasto: Math.round(sum(cRows, 'promedio_gasto')),
        imp_dolar: sum(cRows, 'promedio_gasto') > 0
          ? Math.round(sum(cRows, 'promedio_impresiones') / sum(cRows, 'promedio_gasto'))
          : 0,
      }))
      .sort((a, b) => b.anuncios - a.anuncios)

    return {
      partido: p,
      short: p === 'Partido Nacional' ? 'PN' : p === 'Frente Amplio' ? 'FA' : p === 'Partido Colorado' ? 'PC' : 'Otros',
      color: PARTY_COLORS[p] || '#6B7280',
      candidatos,
      total: {
        anuncios: partyRows.length,
        impresiones: Math.round(sum(partyRows, 'promedio_impresiones')),
        gasto: Math.round(sum(partyRows, 'promedio_gasto')),
        imp_dolar: sum(partyRows, 'promedio_gasto') > 0
          ? Math.round(sum(partyRows, 'promedio_impresiones') / sum(partyRows, 'promedio_gasto'))
          : 0,
      },
    }
  })
}

export function computeNacionalesPartidos(rows) {
  const nacionales = rows.filter(r => r.etapa === 'Nacionales')
  const parties = ['Partido Nacional', 'Frente Amplio', 'Partido Colorado', 'Otros']
  const sum = (arr, f) => arr.reduce((s, r) => s + (Number(r[f]) || 0), 0)

  return parties.map(p => {
    const pRows = nacionales.filter(r => r.part_org_normalized === p)
    const gasto = Math.round(sum(pRows, 'promedio_gasto'))
    const imp = Math.round(sum(pRows, 'promedio_impresiones'))
    return {
      partido: p,
      short: p === 'Partido Nacional' ? 'PN' : p === 'Frente Amplio' ? 'FA' : p === 'Partido Colorado' ? 'PC' : 'Otros',
      color: PARTY_COLORS[p] || '#6B7280',
      anuncios: pRows.length,
      impresiones: imp,
      gasto,
      imp_dolar: gasto > 0 ? Math.round(imp / gasto) : 0,
    }
  })
}

export function computeTopCuentas(rows) {
  const nacionales = rows.filter(r => r.etapa === 'Nacionales')

  // Aggregate by page_name
  const pageMap = {}
  nacionales.forEach(r => {
    const name = r.page_name || 'Desconocido'
    if (!pageMap[name]) pageMap[name] = { anuncios: 0, gasto: 0, impresiones: 0 }
    pageMap[name].anuncios++
    pageMap[name].gasto += Number(r.promedio_gasto) || 0
    pageMap[name].impresiones += Number(r.promedio_impresiones) || 0
  })

  const pages = Object.entries(pageMap).map(([nombre, v]) => ({
    nombre,
    anuncios: v.anuncios,
    gasto: Math.round(v.gasto),
    impresiones: Math.round(v.impresiones),
  }))

  const topAnuncios = [...pages].sort((a, b) => b.anuncios - a.anuncios).slice(0, 5)
  const topGasto = [...pages].sort((a, b) => b.gasto - a.gasto).slice(0, 5)
  const topImp = [...pages].sort((a, b) => b.impresiones - a.impresiones).slice(0, 5)

  return Array.from({ length: 5 }, (_, i) => ({
    ranking: i + 1,
    anuncios: topAnuncios[i] ? { nombre: topAnuncios[i].nombre, valor: topAnuncios[i].anuncios } : null,
    gasto: topGasto[i] ? { nombre: topGasto[i].nombre, valor: topGasto[i].gasto } : null,
    impresiones: topImp[i] ? { nombre: topImp[i].nombre, valor: topImp[i].impresiones } : null,
  }))
}

// ─── Computar datos para charts de Home ─────────────────────────────────────

export function computeTimeSeries(rows) {
  // Group by month (fecha is "YYYY-MM")
  const monthly = {}
  rows.forEach(r => {
    const month = r.fecha
    if (!month) return
    if (!monthly[month]) monthly[month] = 0
    monthly[month]++
  })

  return Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, count]) => ({ fecha, total: count }))
}

export function computeDeptDistribution(rows) {
  const map = {}
  rows.forEach(r => {
    const d = r.departamento_nacional || 'Nacional'
    if (d === 'Nacional') return
    if (!map[d]) map[d] = { count: 0, imp: 0, gasto: 0 }
    map[d].count++
    map[d].imp += Number(r.promedio_impresiones) || 0
    map[d].gasto += Number(r.promedio_gasto) || 0
  })
  const totalImp = Object.values(map).reduce((s, v) => s + v.imp, 0)
  return Object.entries(map)
    .map(([nombre, v]) => ({
      nombre,
      anuncios: v.count,
      impresiones: Math.round(v.imp),
      gasto: Math.round(v.gasto),
      pct: totalImp > 0 ? +((v.imp / totalImp) * 100).toFixed(1) : 0,
    }))
    .sort((a, b) => b.impresiones - a.impresiones)
}

// ─── Estadísticas filtradas para Home page ───────────────────────────────────
export function computeFilteredStats(rows) {
  const sum = (arr, f) => arr.reduce((s, r) => s + (Number(r[f]) || 0), 0)
  const totalImp = sum(rows, 'promedio_impresiones')
  const totalGasto = sum(rows, 'promedio_gasto')
  const uniquePages = new Set(rows.filter(r => r.page_id).map(r => r.page_id)).size

  // Per-party breakdown
  const parties = ['Partido Nacional', 'Frente Amplio', 'Partido Colorado', 'Otros']
  const byParty = parties.map(p => {
    const pRows = rows.filter(r => r.part_org_normalized === p)
    const g = sum(pRows, 'promedio_gasto')
    const imp = sum(pRows, 'promedio_impresiones')
    return {
      partido: p,
      short: p === 'Partido Nacional' ? 'PN' : p === 'Frente Amplio' ? 'FA' : p === 'Partido Colorado' ? 'PC' : 'Otros',
      color: PARTY_COLORS[p] || '#6B7280',
      anuncios: pRows.length,
      gasto: Math.round(g),
      impresiones: Math.round(imp),
      imp_dolar: g > 0 ? Math.round(imp / g) : 0,
      cuentas: new Set(pRows.filter(r => r.page_id).map(r => r.page_id)).size,
    }
  })

  // Top 5 accounts (all data, not just nacionales)
  const pageMap = {}
  rows.forEach(r => {
    const name = r.page_name || 'Desconocido'
    if (!pageMap[name]) pageMap[name] = { anuncios: 0, gasto: 0, impresiones: 0 }
    pageMap[name].anuncios++
    pageMap[name].gasto += Number(r.promedio_gasto) || 0
    pageMap[name].impresiones += Number(r.promedio_impresiones) || 0
  })
  const pages = Object.entries(pageMap).map(([nombre, v]) => ({
    nombre,
    anuncios: v.anuncios,
    gasto: Math.round(v.gasto),
    impresiones: Math.round(v.impresiones),
  }))
  const topAnuncios = [...pages].sort((a, b) => b.anuncios - a.anuncios).slice(0, 5)
  const topGasto = [...pages].sort((a, b) => b.gasto - a.gasto).slice(0, 5)
  const topImp = [...pages].sort((a, b) => b.impresiones - a.impresiones).slice(0, 5)

  return {
    totalAnuncios: rows.length,
    totalImp: Math.round(totalImp),
    totalGasto: Math.round(totalGasto),
    cuentas: uniquePages,
    impDolar: totalGasto > 0 ? Math.round(totalImp / totalGasto) : 0,
    byParty,
    top5: Array.from({ length: 5 }, (_, i) => ({
      ranking: i + 1,
      anuncios: topAnuncios[i] ? { nombre: topAnuncios[i].nombre, valor: topAnuncios[i].anuncios } : null,
      gasto: topGasto[i] ? { nombre: topGasto[i].nombre, valor: topGasto[i].gasto } : null,
      impresiones: topImp[i] ? { nombre: topImp[i].nombre, valor: topImp[i].impresiones } : null,
    })),
  }
}

export function computeHeatmapFromReal(rows) {
  // Since tipo in real data is 'video'/'imagen'/null (not the ROUBERTa classification),
  // we compute party × media type instead
  const parties = ['Partido Nacional', 'Frente Amplio', 'Partido Colorado', 'Otros']
  return parties.map(p => {
    const pRows = rows.filter(r => r.part_org_normalized === p)
    const n = pRows.length
    const video = pRows.filter(r => r.tipo === 'video').length
    const imagen = pRows.filter(r => r.tipo === 'imagen').length
    const sin = pRows.filter(r => !r.tipo).length
    return {
      nombre: p,
      video: n > 0 ? +((video / n) * 100).toFixed(1) : 0,
      imagen: n > 0 ? +((imagen / n) * 100).toFixed(1) : 0,
      sin_clasificar: n > 0 ? +((sin / n) * 100).toFixed(1) : 0,
    }
  })
}

// ─── GastoKPIs desde datos reales ───────────────────────────────────────────
export function computeKPIs(rows, meta) {
  return [
    {
      label: 'Anuncios analizados',
      value: meta.total_anuncios.toLocaleString('es-UY'),
      sub: `Internas: ${meta.anuncios_internas.toLocaleString('es-UY')} · Nacionales: ${meta.anuncios_nacionales.toLocaleString('es-UY')}`,
    },
    {
      label: 'Gasto total estimado en Meta',
      value: `U$S ${meta.gasto_total.toLocaleString('es-UY')}`,
      sub: `Internas: U$S ${meta.gasto_internas.toLocaleString('es-UY')} · Nacionales: U$S ${meta.gasto_nacionales.toLocaleString('es-UY')}`,
    },
    {
      label: 'Cuentas anunciantes',
      value: `${meta.cuentas_internas} / ${meta.cuentas_nacionales}`,
      sub: 'Internas / Nacionales',
    },
    {
      label: 'Total impresiones est.',
      value: meta.imp_total > 1e6
        ? `${(meta.imp_total / 1e6).toFixed(0)} M`
        : meta.imp_total.toLocaleString('es-UY'),
      sub: `Internas: ${meta.imp_internas > 1e6 ? (meta.imp_internas / 1e6).toFixed(0) + ' M' : meta.imp_internas.toLocaleString('es-UY')} · Nacionales: ${meta.imp_nacionales > 1e6 ? (meta.imp_nacionales / 1e6).toFixed(0) + ' M' : meta.imp_nacionales.toLocaleString('es-UY')}`,
    },
  ]
}
