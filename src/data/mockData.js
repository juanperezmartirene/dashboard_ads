// ─── Tipos de anuncio ────────────────────────────────────────────────────────
export const AD_TYPES = [
  { tipo: 'Promoción',  cantidad: 10438, pct: 86.2, f1: 0.86, color: '#6366F1' },
  { tipo: 'CTA',        cantidad:  7536, pct: 62.3, f1: 0.68, color: '#3B82F6' },
  { tipo: 'Tema',       cantidad:  5782, pct: 47.8, f1: 0.76, color: '#10B981' },
  { tipo: 'Imagen',     cantidad:  3226, pct: 26.7, f1: 0.65, color: '#F59E0B' },
  { tipo: 'Ceremonial', cantidad:  2131, pct: 17.6, f1: 0.75, color: '#8B5CF6' },
  { tipo: 'Ataque',     cantidad:  1398, pct: 11.6, f1: 0.51, color: '#EF4444' },
]

// ─── Partidos ─────────────────────────────────────────────────────────────────
export const PARTIES = [
  { nombre: 'Frente Amplio',    cantidad: 3150, pct: 26, promocion: 33, ataque: 6,  tema: 19, imagen: 7,  cta: 25, ceremonial: 5 },
  { nombre: 'Partido Nacional', cantidad: 4200, pct: 35, promocion: 35, ataque: 3,  tema: 13, imagen: 9,  cta: 23, ceremonial: 4 },
  { nombre: 'Partido Colorado', cantidad: 3400, pct: 28, promocion: 36, ataque: 4,  tema: 17, imagen: 12, cta: 24, ceremonial: 6 },
  { nombre: 'Otros',            cantidad: 1346, pct: 11, promocion: 34, ataque: 5,  tema: 23, imagen: 6,  cta: 29, ceremonial: 3 },
]

// ─── Etapas electorales ───────────────────────────────────────────────────────
export const ETAPAS = [
  { nombre: 'Internas',   fecha: '30 Jun 2024',  cantidad: 6192, marker: new Date('2024-06-30') },
  { nombre: 'Nacionales', fecha: '27 Oct 2024',  cantidad: 5547, marker: new Date('2024-10-27') },
  { nombre: 'Ballottage', fecha: '24 Nov 2024',  cantidad:  357, marker: new Date('2024-11-24') },
]

// ─── Departamentos ────────────────────────────────────────────────────────────
export const DEPARTAMENTOS = [
  { nombre: 'Montevideo',     impresiones: 542000, pct: 45.2 },
  { nombre: 'Canelones',      impresiones: 187000, pct: 15.6 },
  { nombre: 'Maldonado',      impresiones:  89000, pct:  7.4 },
  { nombre: 'Salto',          impresiones:  67000, pct:  5.6 },
  { nombre: 'Paysandú',       impresiones:  54000, pct:  4.5 },
  { nombre: 'Rivera',         impresiones:  43000, pct:  3.6 },
  { nombre: 'Colonia',        impresiones:  38000, pct:  3.2 },
  { nombre: 'San José',       impresiones:  35000, pct:  2.9 },
  { nombre: 'Rocha',          impresiones:  28000, pct:  2.3 },
  { nombre: 'Tacuarembó',     impresiones:  22000, pct:  1.8 },
  { nombre: 'Artigas',        impresiones:  18000, pct:  1.5 },
  { nombre: 'Florida',        impresiones:  15000, pct:  1.2 },
  { nombre: 'Río Negro',      impresiones:  12000, pct:  1.0 },
  { nombre: 'Cerro Largo',    impresiones:  11000, pct:  0.9 },
  { nombre: 'Durazno',        impresiones:   9000, pct:  0.7 },
  { nombre: 'Soriano',        impresiones:   8000, pct:  0.7 },
  { nombre: 'Lavalleja',      impresiones:   7000, pct:  0.6 },
  { nombre: 'Flores',         impresiones:   5000, pct:  0.4 },
  { nombre: 'Treinta y Tres', impresiones:   4000, pct:  0.3 },
]

// ─── Serie temporal semanal (determinista) ────────────────────────────────────
function genTimeSeries() {
  // Simple LCG for deterministic "random" values
  let seed = 42
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff
    return seed / 0x7fffffff
  }

  const rows = []
  const start = new Date('2023-10-02')
  const end   = new Date('2024-11-25')
  let cur = new Date(start)
  let i = 0

  while (cur <= end) {
    const phaseMult = 1 + i * 0.025
    const isElection = cur >= new Date('2024-09-01') && cur <= new Date('2024-11-05')
    const peak = isElection ? 2.6 : 1.0
    const n = () => 0.78 + rand() * 0.44

    rows.push({
      fecha:        cur.toISOString().slice(0, 10),
      Promoción:    Math.round(118 * phaseMult * peak * n()),
      CTA:          Math.round( 88 * phaseMult * peak * n()),
      Tema:         Math.round( 63 * phaseMult * peak * n()),
      Imagen:       Math.round( 36 * phaseMult * peak * n()),
      Ceremonial:   Math.round( 21 * phaseMult * peak * n()),
      Ataque:       Math.round( 13 * phaseMult * peak * n()),
    })

    cur.setDate(cur.getDate() + 7)
    i++
  }
  return rows
}

export const TIME_SERIES = genTimeSeries()

// ─── Datos tabla (200 filas, deterministas) ───────────────────────────────────
function genTableData() {
  const tipos      = ['Promoción', 'CTA', 'Tema', 'Imagen', 'Ceremonial', 'Ataque']
  const partidos   = ['Frente Amplio', 'Partido Nacional', 'Partido Colorado', 'Otros']
  const etapas     = ['Internas', 'Nacionales', 'Ballottage']
  const territorios= ['Nacional', 'Montevideo', 'Interior']
  const combos     = ['Promo Programática', 'Promo Imagen', 'Ataque Programático', 'Ataque Imagen']

  let seed = 99
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff
    return seed / 0x7fffffff
  }
  const pick = (arr) => arr[Math.floor(rand() * arr.length)]

  return Array.from({ length: 200 }, (_, i) => ({
    id:          i + 1,
    tipo:        pick(tipos),
    partido:     pick(partidos),
    etapa:       pick(etapas),
    territorio:  pick(territorios),
    gasto:       `$${(Math.floor(rand() * 40) + 5) * 100}–$${(Math.floor(rand() * 60) + 50) * 100}`,
    impresiones: Math.floor(rand() * 90000) + 10000,
    combinacion: pick(combos),
  }))
}

export const TABLE_DATA = genTableData()

export const METADATA = {
  total_anuncios: 12096,
  periodo:        'Oct 2023 – Nov 2024',
  modelo:         'ROUBERTa',
  f1_score:       0.78,
  ultima_act:     '24/03/2026',
}
