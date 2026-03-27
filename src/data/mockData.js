// ─── Estructura de columnas reales esperadas ──────────────────────────────────
// page_name | demographic_distribution | delivery_by_region | part_org |
// pre_pres  | lista_sector_candidato   | departamento_nacional | text_body |
// advocacy  | attack | image | issue | call_to_action | ceremonial  (binarias 0/1)
//
// COLUMNAS PENDIENTES (no disponibles aún, se mockean):
//   fecha        → necesaria para TIME_SERIES
//   gasto        → necesaria para gastoData individual
//   impresiones  → necesaria para gastoData individual

// ─── Configuración de partidos y candidatos (pesos basados en paper) ──────────
const PARTIDO_CONFIG = [
  {
    part_org: 'Partido Nacional',
    weight: 0.35,
    precandidatos: [
      { nombre: 'Álvaro Delgado',  weight: 0.59 },
      { nombre: 'Laura Raffo',     weight: 0.31 },
      { nombre: 'Jorge Gandini',   weight: 0.07 },
      { nombre: 'Otro PN',         weight: 0.03 },
    ],
    // Perfil de tipología (probabilidad de cada tipo)
    tipologia: { advocacy: 0.87, attack: 0.05, image: 0.09, issue: 0.15, call_to_action: 0.62, ceremonial: 0.04 },
    paginas: ['Partido Nacional', 'Álvaro Delgado', 'Laura Raffo Presidente', 'PN Campaña 2024', 'Blancos con Ojeda'],
  },
  {
    part_org: 'Frente Amplio',
    weight: 0.25,
    precandidatos: [
      { nombre: 'Yamandú Orsi',   weight: 0.44 },
      { nombre: 'Carolina Cosse', weight: 0.37 },
      { nombre: 'Andrés Lima',    weight: 0.15 },
      { nombre: 'Otro FA',        weight: 0.04 },
    ],
    tipologia: { advocacy: 0.85, attack: 0.06, image: 0.07, issue: 0.20, call_to_action: 0.65, ceremonial: 0.05 },
    paginas: ['Frente Amplio', 'Yamandú Orsi Presidente', 'Carolina Cosse', 'MPP', 'Convocatoria Seregnista'],
  },
  {
    part_org: 'Partido Colorado',
    weight: 0.28,
    precandidatos: [
      { nombre: 'Andrés Ojeda',      weight: 0.30 },
      { nombre: 'Gabriel Gurmendez', weight: 0.31 },
      { nombre: 'Robert Silva',      weight: 0.19 },
      { nombre: 'Tabaré Viera',      weight: 0.20 },
    ],
    tipologia: { advocacy: 0.88, attack: 0.04, image: 0.12, issue: 0.17, call_to_action: 0.60, ceremonial: 0.06 },
    paginas: ['Partido Colorado', 'Andrés Ojeda Presidente', 'Gurmendez Colorado', 'Colorado 2024', 'Blancos con Ojeda'],
  },
  {
    part_org: 'Otros',
    weight: 0.12,
    precandidatos: [
      { nombre: 'Pablo Mieres',      weight: 0.40 },
      { nombre: 'Guido Manini Ríos', weight: 0.35 },
      { nombre: 'Otro',              weight: 0.25 },
    ],
    tipologia: { advocacy: 0.80, attack: 0.08, image: 0.10, issue: 0.25, call_to_action: 0.55, ceremonial: 0.03 },
    paginas: ['Partido Independiente', 'Cabildo Abierto', 'Manini Ríos', 'Lista 40 Artigas', 'Espacio Cuarenta'],
  },
]

const DEPARTAMENTOS_UY = [
  'Montevideo', 'Canelones', 'Maldonado', 'Salto', 'Paysandú',
  'Rivera', 'Colonia', 'San José', 'Rocha', 'Tacuarembó',
  'Artigas', 'Florida', 'Río Negro', 'Cerro Largo', 'Durazno',
  'Soriano', 'Lavalleja', 'Flores', 'Treinta y Tres',
]

const TEXTOS_MOCK = [
  'Uruguay merece un gobierno que trabaje para todos. Sumate al cambio que el país necesita.',
  'Defendemos la educación pública, la seguridad y el trabajo de los uruguayos.',
  'El trabajo es el motor del progreso. Tu voto construye el futuro del país.',
  'Nuestra propuesta para la salud y la vivienda ya está lista. Conocela.',
  'Juntos construimos un Uruguay mejor para las próximas generaciones.',
  'La transparencia y la honestidad guían nuestro programa de gobierno.',
  'Invertimos en infraestructura para conectar todo el territorio nacional.',
  'Protegemos a los jubilados y pensionistas con políticas concretas.',
  'La seguridad pública es nuestra prioridad. Tenemos un plan.',
  'Compartí este mensaje. Uruguay necesita un liderazgo comprometido.',
  'Votá con convicción. Este es el momento de hacer historia.',
  'El interior también importa. Nuestras propuestas llegan a cada rincón.',
  'Educación de calidad para todos los niños y jóvenes del país.',
  'Economía fuerte, empleos estables, futuro asegurado para tu familia.',
  'Escuchamos a los vecinos. Tu opinión define nuestro programa.',
]

const SECTORES_MOCK = [
  'Lista 2121', 'Lista 609', 'Lista 2000', 'Lista 711', 'Lista 40',
  'MPP', 'Espacio 609', 'Convocatoria Seregnista', 'Frente Líber Seregni',
  'Renovación y Cambio', 'Corriente de Acción', 'Herrerismo',
]

// ─── LCG determinista ─────────────────────────────────────────────────────────
let seed = 42
const rand = () => {
  seed = (seed * 1664525 + 1013904223) & 0x7fffffff
  return seed / 0x7fffffff
}
const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const weightedPick = (items) => {
  const r = rand()
  let acc = 0
  for (const item of items) {
    acc += item.weight
    if (r < acc) return item
  }
  return items[items.length - 1]
}

// ─── Genera demographic_distribution realista ─────────────────────────────────
function genDemographic() {
  const ages = ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+']
  // Perfil base: concentración en 25-34 (paper finding)
  const base = [0.02, 0.10, 0.28, 0.22, 0.16, 0.12, 0.10]
  const result = []
  ages.forEach((age, i) => {
    const noise = (rand() - 0.5) * 0.06
    const pct = Math.max(0.01, base[i] + noise)
    // Leve sesgo de mujeres en 25-34 (paper finding)
    const femaleBias = age === '25-34' ? 0.03 : age === '65+' ? -0.04 : 0
    result.push({ age, gender: 'male',   percentage: +(pct * (0.5 - femaleBias / 2)).toFixed(4) })
    result.push({ age, gender: 'female', percentage: +(pct * (0.5 + femaleBias / 2)).toFixed(4) })
  })
  return result
}

// ─── Genera delivery_by_region realista ───────────────────────────────────────
function genDelivery(departamentoNacional) {
  if (departamentoNacional !== 'Nacional') {
    // Anuncio geográfico: concentrado en ese departamento
    const result = [{ region: departamentoNacional, percentage: 0.85 }]
    const resto = DEPARTAMENTOS_UY.filter(d => d !== departamentoNacional).slice(0, 3)
    const restoPct = 0.15 / resto.length
    resto.forEach(d => result.push({ region: d, percentage: +restoPct.toFixed(4) }))
    return result
  }
  // Anuncio nacional: distribución proporcional a población
  const weights = [0.42, 0.16, 0.07, 0.05, 0.04, 0.04, 0.03, 0.03, 0.02, 0.02,
                   0.02, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01]
  return DEPARTAMENTOS_UY.map((d, i) => ({
    region: d,
    percentage: +(weights[i] * (0.85 + rand() * 0.30)).toFixed(4),
  }))
}

// ─── Generador principal de anuncios individuales ─────────────────────────────
function generateAds(n) {
  seed = 42 // reset para determinismo
  return Array.from({ length: n }, (_, id) => {
    const partido      = weightedPick(PARTIDO_CONFIG)
    const precandidato = weightedPick(partido.precandidatos)
    const esNacional   = rand() > 0.40
    const depto        = esNacional ? 'Nacional' : pick(DEPARTAMENTOS_UY)
    const tipo         = partido.tipologia

    // Binarias con probabilidad del partido + ruido individual
    const advocacy      = rand() < tipo.advocacy      ? 1 : 0
    const attack        = rand() < tipo.attack        ? 1 : 0
    const image         = rand() < tipo.image         ? 1 : 0
    const issue         = rand() < tipo.issue         ? 1 : 0
    const call_to_action = rand() < tipo.call_to_action ? 1 : 0
    const ceremonial    = rand() < tipo.ceremonial    ? 1 : 0

    // Fecha (mock — reemplazar con columna real)
    const startMs   = new Date('2023-10-01').getTime()
    const endMs     = new Date('2024-11-24').getTime()
    const fecha     = new Date(startMs + rand() * (endMs - startMs))
      .toISOString().slice(0, 10)

    // Gasto e impresiones (mock — reemplazar con columnas reales)
    const gastoMin  = Math.floor(rand() * 800 + 100)
    const gastoMax  = gastoMin + Math.floor(rand() * 600 + 100)
    const impMin    = Math.floor(rand() * 80000 + 5000)
    const impMax    = impMin + Math.floor(rand() * 40000 + 5000)

    return {
      id,
      page_name:                 pick(partido.paginas),
      demographic_distribution:  genDemographic(),
      delivery_by_region:        genDelivery(depto),
      part_org:                  partido.part_org,
      pre_pres:                  precandidato.nombre,
      lista_sector_candidato:    pick(SECTORES_MOCK),
      departamento_nacional:     depto,
      text_body:                 pick(TEXTOS_MOCK),
      // Binarias por tipología
      advocacy,
      attack,
      image,
      issue,
      call_to_action,
      ceremonial,
      // Columnas mock (reemplazar con datos reales)
      _fecha:       fecha,
      _gasto:       `$${gastoMin}–$${gastoMax}`,
      _impresiones: Math.round((impMin + impMax) / 2),
    }
  })
}

// ─── Exports ──────────────────────────────────────────────────────────────────
export const TABLE_DATA = generateAds(500)

// Etapas electorales (estáticas — no dependen de filas individuales)
export const ETAPAS = [
  { nombre: 'Internas',   fecha: '30 Jun 2024',  cantidad: 6955, marker: new Date('2024-06-30') },
  { nombre: 'Nacionales', fecha: '27 Oct 2024',  cantidad: 6021, marker: new Date('2024-10-27') },
  { nombre: 'Ballottage', fecha: '24 Nov 2024',  cantidad:  357, marker: new Date('2024-11-24') },
]

// TIME_SERIES: mock hasta que se disponga de columna fecha real
function genTimeSeries() {
  seed = 99
  const rows = []
  const start = new Date('2023-10-02')
  const end   = new Date('2024-11-25')
  let cur = new Date(start), i = 0
  while (cur <= end) {
    const phaseMult = 1 + i * 0.025
    const isPeak = cur >= new Date('2024-09-01') && cur <= new Date('2024-11-05')
    const peak = isPeak ? 2.6 : 1.0
    const n = () => 0.78 + rand() * 0.44
    rows.push({
      fecha:      cur.toISOString().slice(0, 10),
      Promoción:  Math.round(118 * phaseMult * peak * n()),
      CTA:        Math.round( 88 * phaseMult * peak * n()),
      Tema:       Math.round( 63 * phaseMult * peak * n()),
      Imagen:     Math.round( 36 * phaseMult * peak * n()),
      Ceremonial: Math.round( 21 * phaseMult * peak * n()),
      Ataque:     Math.round( 13 * phaseMult * peak * n()),
    })
    cur.setDate(cur.getDate() + 7)
    i++
  }
  return rows
}
export const TIME_SERIES = genTimeSeries()
