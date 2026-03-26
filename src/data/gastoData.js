// ─── Fuente: Bogliaccini, Fynn, Piñeiro-Rodríguez & Rosenblatt (2025) ─────────
// "Gasto y estrategias de publicidad en Meta en las elecciones de 2024 en Uruguay"

export const GASTO_META = {
  total_anuncios:      12976,
  anuncios_internas:    6955,
  anuncios_nacionales:  6021,
  gasto_total:       1293638,
  gasto_internas:     578241,
  gasto_nacionales:   715397,
  periodo_internas:   '1 oct. 2023 – 30 jun. 2024',
  periodo_nacionales: '1 jul. – 27 oct. 2024',
  fuente: 'Bogliaccini, Fynn, Piñeiro-Rodríguez & Rosenblatt (2025)',
}

// ─── Comparativo de gasto: Meta vs TV vs publicidad declarada ─────────────────
// Fuente: Tabla 1 del paper (elecciones nacionales, primera vuelta)
export const GASTO_PARTIDO = [
  {
    partido:       'Partido Nacional',
    short:         'PN',
    color:         '#1D4ED8',
    egresos:       8326475,
    publicidad:    3882751,
    television:    1995399,
    meta_nacionales: 285107,
    meta_internas:   331282,
    meta_total:      616389,
    pct_meta_tv: 31,   // meta_total / television * 100 ≈ 31%
    pct_meta_pub: 16,  // meta_total / publicidad * 100 ≈ 16%
  },
  {
    partido:       'Frente Amplio',
    short:         'FA',
    color:         '#DC2626',
    egresos:       12229481,
    publicidad:    3494600,
    television:    1244098,
    meta_nacionales: 260043,
    meta_internas:   136209,
    meta_total:      396252,
    pct_meta_tv: 32,
    pct_meta_pub: 11,
  },
  {
    partido:       'Partido Colorado',
    short:         'PC',
    color:         '#D97706',
    egresos:       3978493,
    publicidad:    2046289,
    television:     959271,
    meta_nacionales: 170247,
    meta_internas:   110749,
    meta_total:      280996,
    pct_meta_tv: 29,
    pct_meta_pub: 14,
  },
]

// ─── Totales para comparativo general ────────────────────────────────────────
export const GASTO_TOTAL_COMPARATIVO = [
  { label: 'Total egresos declarados', valor: 24534449, desc: 'Suma FA + PN + PC, elecciones nacionales' },
  { label: 'Gasto en publicidad',      valor:  9423640, desc: 'Publicidad declarada (todas las listas)' },
  { label: 'Gasto en televisión',      valor:  4198768, desc: 'Reportado por canales 4, 10 y 12' },
  { label: 'Gasto total en Meta',      valor:  1293638, desc: 'Internas + primera vuelta (FA, PN, PC)' },
]

// ─── Elecciones internas — por precandidato ───────────────────────────────────
// Fuente: Tabla 2 del paper
export const INTERNAS_CANDIDATOS = [
  {
    partido: 'Partido Nacional', short: 'PN', color: '#1D4ED8',
    candidatos: [
      { nombre: 'Álvaro Delgado',  anuncios: 2061, impresiones: 129217469, gasto: 167549, imp_dolar: 771 },
      { nombre: 'Laura Raffo',     anuncios: 1082, impresiones:  92656959, gasto: 123340, imp_dolar: 751 },
      { nombre: 'Jorge Gandini',   anuncios:  239, impresiones:  10891380, gasto:  16324, imp_dolar: 667 },
      { nombre: 'Otros PN',        anuncios:   92, impresiones:  17404455, gasto:  24069, imp_dolar: 723 },
    ],
    total: { anuncios: 3474, impresiones: 250170263, gasto: 331282, imp_dolar: 755 },
  },
  {
    partido: 'Frente Amplio', short: 'FA', color: '#DC2626',
    candidatos: [
      { nombre: 'Yamandú Orsi',    anuncios:  732, impresiones:  59234634, gasto:  63209, imp_dolar:  937 },
      { nombre: 'Carolina Cosse',  anuncios:  623, impresiones:  53016688, gasto:  66739, imp_dolar:  794 },
      { nombre: 'Andrés Lima',     anuncios:  249, impresiones:   4555375, gasto:   3305, imp_dolar: 1378 },
      { nombre: 'Otros FA',        anuncios:   58, impresiones:   3273472, gasto:   2956, imp_dolar: 1107 },
    ],
    total: { anuncios: 1662, impresiones: 120080169, gasto: 136209, imp_dolar: 882 },
  },
  {
    partido: 'Partido Colorado', short: 'PC', color: '#D97706',
    candidatos: [
      { nombre: 'Gabriel Gurmendez', anuncios: 365, impresiones: 44148317, gasto: 31378, imp_dolar: 1407 },
      { nombre: 'Tabaré Viera',      anuncios: 278, impresiones: 12633861, gasto: 12486, imp_dolar: 1012 },
      { nombre: 'Andrés Ojeda',      anuncios: 231, impresiones: 27147884, gasto: 22681, imp_dolar: 1197 },
      { nombre: 'Robert Silva',      anuncios: 229, impresiones: 28517386, gasto: 37802, imp_dolar:  754 },
      { nombre: 'Otros PC',          anuncios:  84, impresiones:  9836958, gasto:  6402, imp_dolar: 1537 },
    ],
    total: { anuncios: 1187, impresiones: 122284406, gasto: 110749, imp_dolar: 1104 },
  },
  {
    partido: 'Otros', short: 'Otros', color: '#6B7280',
    candidatos: [],
    total: { anuncios: 632, impresiones: 22582684, gasto: 35137, imp_dolar: 643 },
  },
]

// ─── Elecciones nacionales — por partido ──────────────────────────────────────
// Fuente: Tabla 3 del paper
export const NACIONALES_PARTIDOS = [
  { partido: 'Partido Nacional', short: 'PN', color: '#1D4ED8', anuncios: 2461, impresiones: 184601082, gasto: 285107, imp_dolar: 505 },
  { partido: 'Frente Amplio',    short: 'FA', color: '#DC2626', anuncios: 1836, impresiones: 143924770, gasto: 260043, imp_dolar: 710 },
  { partido: 'Partido Colorado', short: 'PC', color: '#D97706', anuncios:  884, impresiones:  80408080, gasto: 170247, imp_dolar: 472 },
  { partido: 'Otros',            short: 'Otros', color: '#6B7280', anuncios: 840, impresiones:  55503558, gasto:  69609, imp_dolar: 797 },
]

// ─── Principales cuentas en elecciones nacionales ────────────────────────────
// Fuente: Tabla 4 del paper
export const TOP_CUENTAS = [
  {
    ranking: 1,
    anuncios:    { nombre: 'Lista 40 Artigas',         valor: 242 },
    gasto:       { nombre: 'Andrés Ojeda Presidente',  valor: 66908 },
    impresiones: { nombre: 'Convocatoria Seregnista',  valor: 32798475 },
  },
  {
    ranking: 2,
    anuncios:    { nombre: 'Pablo Mieres',             valor: 164 },
    gasto:       { nombre: 'Yamandú Orsi Presidente',  valor: 58330 },
    impresiones: { nombre: 'Andrés Ojeda Presidente',  valor: 26978958 },
  },
  {
    ranking: 3,
    anuncios:    { nombre: 'Espacio Cuarenta',         valor: 147 },
    gasto:       { nombre: 'Juan Sartori',             valor: 54399 },
    impresiones: { nombre: 'MPP',                      valor: 21214435 },
  },
  {
    ranking: 4,
    anuncios:    { nombre: 'Andrés Lima',              valor: 145 },
    gasto:       { nombre: 'Blancos con Ojeda',        valor: 49267 },
    impresiones: { nombre: 'Blancos con Ojeda',        valor: 19233967 },
  },
  {
    ranking: 5,
    anuncios:    { nombre: 'MPP',                      valor: 130 },
    gasto:       { nombre: 'Convocatoria Seregnista',  valor: 41632 },
    impresiones: { nombre: 'Yamandú Orsi Presidente',  valor: 18651480 },
  },
]
