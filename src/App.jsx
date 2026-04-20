import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Header from './components/Header'
import FilterPanel from './components/FilterPanel'
import DataTable from './components/DataTable'
import Footer from './components/Footer'
import {
  ChartBox, AnimatedNumber,
  HomeKPIs, HomePartyChart, HomeDeptMap,
  HomeLineChart, HomeDemoPyramid, HomeTop5,
} from './components/HomeCharts'
import {
  processData, mergeClasificacion,
  computeDeptDistribution,
  computeFilteredStats,
  computeTimeSeries,
  computeAggregateDemographics,
  computeAggregateDemographicsWithGasto,
  computeGastoGenero,
  computePagePartyMap,
  computeTiposTotales, computeCombinaciones, computeTiposPorEtapa,
  computeTiposPorPartido, computeGastoImpPorTipo, computeTiposPorTerritorio,
  computeSerieTemporal,
  DEPTO_MAP,
} from './data/processRealData'
import PageTipos from './components/PageTipos'
import PageComparacion from './components/PageComparacion'

// ─── Layout primitives (solo usadas en App.jsx) ──────────────────────────────

function Section({ id, gray, children }) {
  return (
    <section
      id={id}
      style={{ backgroundColor: gray ? '#F9FAFB' : '#FFFFFF' }}
      className="py-10 md:py-14 border-t border-gray-100"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8">{children}</div>
    </section>
  )
}

function SectionMeta({ label }) {
  return (
    <p className="text-xs font-medium tracking-widest mb-2 uppercase" style={{ color: '#0096D1' }}>
      {label}
    </p>
  )
}

function Prose({ children, narrow }) {
  return (
    <p className={`text-sm leading-7 text-gray-600 ${narrow ? 'max-w-2xl' : ''}`}>
      {children}
    </p>
  )
}

// ─── Sección resultados ───────────────────────────────────────────────────────

function HomeResumen({ deptData, filteredStats, timeSeries, demoData, adDetailsLoading, hasFilters, gastoGenero, lineMetric, onLineMetricChange, pagePartyMap }) {
  return (
    <Section id="resultados" gray>
      <SectionMeta label="Resultados" />
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
        <AnimatePresence mode="wait">
          {hasFilters && (
            <motion.p
              key="filtros-activos"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-blue-500 font-medium sm:max-w-xs sm:text-right"
            >
              Filtros activos
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <HomeKPIs stats={filteredStats} />

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <motion.div layout>
          <ChartBox
            title="Anuncios por partido"
            sub="Solo partidos con anuncios según los filtros activos."
          >
            <HomePartyChart stats={filteredStats} />
          </ChartBox>
        </motion.div>

        <motion.div layout id="territorial">
          <ChartBox
            title="Distribución por departamento"
            sub="Solo anuncios con alcance departamental."
          >
            <HomeDeptMap data={deptData} />
          </ChartBox>
        </motion.div>
      </motion.div>

      <motion.div layout className="mb-6">
        <ChartBox
          title="Evolución temporal de anuncios"
          sub="Publicaciones por semana según los filtros activos."
        >
          <HomeLineChart data={timeSeries} metricKey={lineMetric} onMetricChange={onLineMetricChange} />
        </ChartBox>
      </motion.div>

      <motion.div layout className="flex flex-col gap-6">
        <motion.div layout>
          <ChartBox
            title="Demografía"
            sub="Distribución estimada por edad y género. Ponderado por impresiones o gasto."
          >
            <HomeDemoPyramid data={demoData} loading={adDetailsLoading} gastoGenero={gastoGenero} />
          </ChartBox>
        </motion.div>

        <motion.div layout>
          <ChartBox
            title="Top 5 cuentas"
            sub="Ranking de las principales cuentas anunciantes según los filtros activos."
          >
            <HomeTop5 top5={filteredStats.top5} pagePartyMap={pagePartyMap} />
          </ChartBox>
        </motion.div>
      </motion.div>
    </Section>
  )
}

function HomeDatos({ filteredTable, loadingData }) {
  return (
    <Section id="datos">
      <SectionMeta label="Registro de anuncios" />

      <div className="bg-white border border-gray-200 rounded-sm p-5">
        {loadingData ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <div
              className="w-5 h-5 rounded-full border-2 border-gray-200 animate-spin"
              style={{ borderTopColor: '#0096D1' }}
            />
            <span className="text-sm text-gray-400">Cargando datos...</span>
          </div>
        ) : (
          <>
            <DataTable data={filteredTable} />
          </>
        )}
      </div>
    </Section>
  )
}

function PageHome({
  filteredTable, loadingData,
  selectedParties, setSelectedParties,
  selectedEtapa, setSelectedEtapa,
  selectedTerritorio, setSelectedTerritorio,
  selectedDepartamento, setSelectedDepartamento,
  selectedPrecandidato, setSelectedPrecandidato,
  precandidatosList,
  deptData, filteredStats, timeSeries, demoData, adDetailsLoading,
  gastoGenero, lineMetric, onLineMetricChange, pagePartyMap,
}) {
  const hasFilters = selectedParties.length > 0 || selectedEtapa !== 'Todas'
    || selectedTerritorio.length > 0 || selectedDepartamento !== 'Todos'
    || selectedPrecandidato !== 'Todos'
  return (
    <>
      <Section id="filtros">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">
              Publicidad política en Meta · Uruguay 2024
            </h2>
            <Prose narrow>
              Filtrá por partido, etapa electoral, territorio o departamento. Todos los indicadores se actualizan automáticamente.
            </Prose>
          </div>
        </div>
        <FilterPanel
          selectedParties={selectedParties}
          setSelectedParties={setSelectedParties}
          selectedEtapa={selectedEtapa}
          setSelectedEtapa={setSelectedEtapa}
          selectedTerritorio={selectedTerritorio}
          setSelectedTerritorio={setSelectedTerritorio}
          selectedDepartamento={selectedDepartamento}
          setSelectedDepartamento={setSelectedDepartamento}
          selectedPrecandidato={selectedPrecandidato}
          setSelectedPrecandidato={setSelectedPrecandidato}
          precandidatosList={precandidatosList}
        />
      </Section>

      <HomeResumen
        deptData={deptData}
        filteredStats={filteredStats}
        timeSeries={timeSeries}
        demoData={demoData}
        adDetailsLoading={adDetailsLoading}
        hasFilters={hasFilters}
        gastoGenero={gastoGenero}
        lineMetric={lineMetric}
        onLineMetricChange={onLineMetricChange}
        pagePartyMap={pagePartyMap}
      />
      <HomeDatos filteredTable={filteredTable} loadingData={loadingData} />
    </>
  )
}

// ─── METODOLOGÍA PAGE ─────────────────────────────────────────────────────────

function MetodEstudio() {
  return (
    <Section id="estudio">
      <SectionMeta label="El estudio" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-5">
            Sobre este proyecto
          </h2>
          <Prose>
            Este proyecto analiza la publicidad política digital emitida en Meta
            (Facebook e Instagram) durante el ciclo electoral de Uruguay 2024. A
            través de una metodología de clasificación automática, se
            categorizaron{' '}
            <strong className="text-gray-800">12.096 anuncios</strong> según su
            función comunicacional, cubriendo tres etapas electorales: las
            elecciones internas de junio, las nacionales de octubre y el
            balotaje de noviembre.
          </Prose>
          <Prose>
            <span className="block mt-4">
              Los anuncios fueron extraídos de la Meta Ad Library API, que pone
              a disposición pública información sobre publicidad con contenido
              político o social. El corpus cubre el período entre octubre de 2023
              y noviembre de 2024, permitiendo observar la evolución de las
              estrategias comunicacionales a medida que avanza la campaña.
            </span>
          </Prose>
        </div>

        <div>
          <div className="mb-8">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Quiénes somos
            </h3>
            <Prose>
              El equipo está conformado por investigadores especializados en
              comunicación política, análisis computacional de texto y estudios
              electorales. El trabajo forma parte de una agenda de investigación
              sobre el uso de plataformas digitales en campañas políticas
              latinoamericanas.
            </Prose>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Lo que hicimos
            </h3>
            <ol className="space-y-3">
              {[
                'Extracción de anuncios mediante la Meta Ad Library API (oct. 2023 – nov. 2024).',
                'Etiquetado manual de un subconjunto representativo de anuncios según una tipología de seis categorías funcionales.',
                'Entrenamiento de un clasificador automático de texto (ROUBERTa) sobre el corpus etiquetado.',
                'Clasificación del corpus completo y análisis cuantitativo de los patrones resultantes.',
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                  <span className="font-mono text-gray-300 shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </Section>
  )
}

const TYPE_DEFS = [
  {
    tipo: 'Promoción', color: '#1b9e77', cantidad: 10438, pct: 86.2,
    desc: 'Comunica propuestas, logros y atributos positivos del candidato o partido. El emisor se presenta como solución deseable. Es la categoría más frecuente en todas las etapas.',
  },
  {
    tipo: 'CTA', color: '#7570b3', cantidad: 7536, pct: 62.3,
    desc: 'Llamado a la acción explícito: votar, compartir, asistir a un acto, seguir en redes. Suele combinar con otras categorías y crece en intensidad hacia el cierre de campaña.',
  },
  {
    tipo: 'Tema', color: '#e6ab02', cantidad: 5782, pct: 47.8,
    desc: 'Posiciona al candidato respecto a un issue específico: seguridad, salud, educación, economía. Permite identificar las agendas temáticas de cada partido.',
  },
  {
    tipo: 'Imagen', color: '#66a61e', cantidad: 3226, pct: 26.7,
    desc: 'Construye la imagen personal del candidato apelando a atributos humanizantes: familia, trayectoria, valores, cercanía. Predomina en las primeras etapas de la campaña.',
  },
  {
    tipo: 'Ceremonial', color: '#e7298a', cantidad: 2131, pct: 17.6,
    desc: 'Vinculado a fechas especiales o efemérides (Día del Trabajo, independencia, etc.). Tono celebratorio y bajo contenido político directo. Refleja presencia continua en el espacio digital.',
  },
  {
    tipo: 'Ataque', color: '#d95f02', cantidad: 1398, pct: 11.6,
    desc: 'Crítica o contraste con adversarios: señala aspectos negativos de la oposición, su gestión o sus propuestas. Es la categoría menos frecuente del corpus uruguayo.',
  },
]

function MetodTipologia() {
  return (
    <Section id="tipologia" gray>
      <SectionMeta label="La tipología" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 mb-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Seis funciones comunicacionales
          </h2>
          <Prose narrow>
            La tipología clasifica cada anuncio según su función comunicacional
            dominante. Las categorías no son excluyentes: un mismo anuncio puede
            cumplir más de una función, razón por la cual los porcentajes no
            suman 100 %.
          </Prose>
        </div>
        <div>
          <Prose>
            La clasificación se basa en literatura de comunicación política sobre
            publicidad negativa y positiva (Benoit, 1999; Fridkin &amp; Kenney,
            2011), adaptada al contexto latinoamericano. Cada categoría responde
            a una lógica distinta en términos de objetivo persuasivo, audiencia y
            momento de campaña.
          </Prose>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {TYPE_DEFS.map(t => (
          <div
            key={t.tipo}
            className="bg-white rounded-sm border border-gray-200 p-5"
            style={{ borderTop: `4px solid ${t.color}` }}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-800">{t.tipo}</h3>
              <span
                className="text-xs font-mono px-1.5 py-0.5 rounded"
                style={{ backgroundColor: t.color + '18', color: t.color }}
              >
                {t.pct}%
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">{t.desc}</p>
            <p className="text-xs text-gray-300 font-mono">
              {t.cantidad.toLocaleString('es-UY')} anuncios
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-sm p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Frecuencia por categoría</h3>
        <p className="text-xs text-gray-400 mb-5">
          Cantidad de anuncios clasificados en cada tipo. Un anuncio puede figurar en más de una categoría.
        </p>
        <p className="text-xs text-gray-400 italic">
          Clasificación automática multi-etiqueta con ROUBERTa (F1: 0,78) sobre el corpus completo de 12.096 anuncios.
        </p>
      </div>
    </Section>
  )
}

const TIMELINE = [
  { label: 'Inicio del período', date: 'Oct 2023',    sub: '12.096 anuncios' },
  { label: 'Elecciones Internas', date: '30 Jun 2024', sub: '6.192 anuncios'  },
  { label: 'Elecciones Nacionales', date: '27 Oct 2024', sub: '5.547 anuncios' },
  { label: 'Balotaje',            date: '24 Nov 2024', sub: '357 anuncios'   },
]

function MetodCorpus() {
  return (
    <Section id="corpus">
      <SectionMeta label="El corpus" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-5">
            Un corpus de escala electoral completa
          </h2>
          <Prose>
            El corpus comprende la totalidad de los anuncios con declaración
            política publicados por los principales partidos uruguayos en Meta
            durante el ciclo electoral 2023–2024. La extracción se realizó de
            forma continua desde octubre de 2023, permitiendo capturar tanto la
            campaña previa a las internas como la escalada final hacia el
            balotaje.
          </Prose>
          <Prose>
            <span className="block mt-4">
              Los cuatro partidos incluidos —Frente Amplio, Partido Nacional,
              Partido Colorado y Otros— representan el espectro ideológico
              principal de la democracia uruguaya. El Partido Nacional concentra
              el mayor volumen (35 %), seguido por Partido Colorado (28 %) y
              Frente Amplio (26 %).
            </span>
          </Prose>
        </div>

        <div className="flex flex-col gap-6 justify-center">
          {[
            { val: '12.096', label: 'anuncios analizados', sub: 'Oct 2023 – Nov 2024' },
            { val: '4',      label: 'partidos políticos',  sub: 'FA · PN · PC · Otros' },
            { val: '3',      label: 'etapas electorales',  sub: 'Internas · Nacionales · Ballottage' },
          ].map(s => (
            <div key={s.val} className="flex items-baseline gap-4 border-l-2 border-gray-200 pl-5">
              <span className="text-4xl font-mono font-bold text-gray-900">{s.val}</span>
              <div>
                <p className="text-sm font-medium text-gray-700">{s.label}</p>
                <p className="text-xs text-gray-400">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-sm px-4 md:px-8 py-6 md:py-7">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8">
          Línea de tiempo electoral
        </h3>
        <div className="relative">
          <div className="absolute top-3 left-0 right-0 h-px bg-gray-200" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
            {TIMELINE.map((e, i) => (
              <div key={i} className="text-center">
                <div className="w-3 h-3 rounded-full bg-gray-700 mx-auto mb-3" />
                <p className="text-xs font-semibold text-gray-700 mb-1">{e.label}</p>
                <p className="text-xs font-mono text-gray-500">{e.date}</p>
                <p className="text-xs text-gray-400 mt-1">{e.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}

function PageMetodologia() {
  return (
    <>
      <MetodEstudio />
      <MetodTipologia />
      <MetodCorpus />
    </>
  )
}

// ─── EQUIPO PAGE ──────────────────────────────────────────────────────────────

const TEAM = [
  {
    nombre: 'Investigador/a Principal',
    rol: 'Comunicación política',
    desc: 'Especialización en publicidad política digital y análisis de campañas electorales en América Latina. Responsable del diseño de la tipología y el etiquetado manual.',
    area: 'Ciencias Políticas',
  },
  {
    nombre: 'Investigador/a',
    rol: 'Análisis computacional de texto',
    desc: 'Especialización en procesamiento de lenguaje natural y modelos de clasificación para el español. Responsable del entrenamiento y evaluación del modelo ROUBERTa.',
    area: 'Lingüística Computacional',
  },
  {
    nombre: 'Investigador/a',
    rol: 'Estudios electorales',
    desc: 'Especialización en comportamiento electoral y sistemas políticos latinoamericanos. Aporta contexto interpretativo sobre las dinámicas de campaña uruguaya.',
    area: 'Ciencias Políticas',
  },
  {
    nombre: 'Asistente de investigación',
    rol: 'Recolección y procesamiento de datos',
    desc: 'Responsable de la extracción continua de anuncios desde la Meta Ad Library API y el procesamiento del corpus para su análisis.',
    area: 'Ciencia de Datos',
  },
]

function PageEquipo() {
  return (
    <Section>
      <div className="mb-12">
        <SectionMeta label="El equipo" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Quiénes somos
        </h2>
        <Prose narrow>
          El equipo es interdisciplinario: reúne especialistas en comunicación
          política, análisis computacional de texto y estudios electorales. El
          trabajo forma parte de una agenda de investigación sobre el uso de
          plataformas digitales en campañas políticas latinoamericanas.
        </Prose>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
        {TEAM.map((m, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-sm p-6 bg-white"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">{m.nombre}</p>
                <p className="text-xs text-gray-500 mt-0.5">{m.rol}</p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 bg-gray-100 text-gray-500 rounded-sm shrink-0 ml-3">
                {m.area}
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Colaboración y contacto */}
      <div className="border-t border-gray-100 pt-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Contexto institucional
          </h3>
          <Prose>
            El proyecto se desarrolla en el marco de una agenda de investigación
            sobre comunicación política digital en América Latina. Los resultados
            contribuyen a la comprensión del uso estratégico de plataformas
            digitales en contextos electorales de la región.
          </Prose>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Contacto
          </h3>
          <Prose>
            Para consultas sobre el proyecto, el corpus de datos o el modelo de
            clasificación, contactar al equipo de investigación a través de los
            canales institucionales correspondientes.
          </Prose>
          <div className="mt-5 border-l-2 border-gray-200 pl-4">
            <p className="text-xs text-gray-400 italic leading-relaxed">
              Datos del corpus completo con clasificación ROUBERTa.
              Última actualización: abril 2026.
            </p>
          </div>
        </div>
      </div>
    </Section>
  )
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState('home')
  const [selectedParties,      setSelectedParties]      = useState([])
  const [selectedEtapa,        setSelectedEtapa]        = useState('Todas')
  const [selectedTerritorio,   setSelectedTerritorio]   = useState([])
  const [selectedDepartamento, setSelectedDepartamento] = useState('Todos')
  const [selectedPrecandidato, setSelectedPrecandidato] = useState('Todos')
  const [lineMetric,           setLineMetric]           = useState('anuncios')
  const [tableData,       setTableData]       = useState([])
  const [loadingData,     setLoadingData]     = useState(true)
  const [adDetails,       setAdDetails]       = useState(null)
  const [adDetailsLoading, setAdDetailsLoading] = useState(true)

  // Resetear precandidato al cambiar etapa
  const handleSetEtapa = (e) => {
    setSelectedEtapa(e)
    if (e !== 'Internas') setSelectedPrecandidato('Todos')
  }

  useEffect(() => {
    Promise.all([
      fetch('/data/realData.json').then(r => r.json()),
      fetch('/data/clasificacion.json').then(r => r.json()).catch(() => ({})),
    ]).then(([raw, clasif]) => {
      const processed = processData(raw)
      const merged = mergeClasificacion(processed, clasif)
      setTableData(merged)
      setLoadingData(false)
    }).catch(() => setLoadingData(false))
  }, [])

  useEffect(() => {
    fetch('/data/adDetails.json')
      .then(r => r.json())
      .then(data => { setAdDetails(data); setAdDetailsLoading(false) })
      .catch(() => { setAdDetails({}); setAdDetailsLoading(false) })
  }, [])

  // ── Mapa page → partido (calculado sobre todos los datos una sola vez) ──
  const pagePartyMap = useMemo(() => computePagePartyMap(tableData), [tableData])

  // ── Filtrado base (sin filtro de precandidato) ──
  const filteredBase = useMemo(() => {
    let rows = tableData
    if (selectedParties.length > 0)
      rows = rows.filter(r => selectedParties.includes(r.part_org_normalized))
    if (selectedEtapa !== 'Todas')
      rows = rows.filter(r => r.etapa === selectedEtapa)
    if (selectedTerritorio.length > 0) {
      rows = rows.filter(r => {
        const d = r.departamento_nacional
        if (selectedTerritorio.includes('Nacional') && (!d || d === 'Nacional')) return true
        if (selectedTerritorio.includes('Montevideo') && d === 'Montevideo') return true
        if (selectedTerritorio.includes('Interior') && d && d !== 'Nacional' && d !== 'Montevideo') return true
        return false
      })
    }
    if (selectedDepartamento !== 'Todos')
      rows = rows.filter(r => r.departamento_nacional === selectedDepartamento)
    return rows
  }, [tableData, selectedParties, selectedEtapa, selectedTerritorio, selectedDepartamento])

  // ── Lista de precandidatos disponibles (de filteredBase cuando etapa=Internas) ──
  const precandidatosList = useMemo(() => {
    if (selectedEtapa !== 'Internas') return []
    const set = new Set()
    filteredBase.forEach(r => { if (r.pre_pres_display) set.add(r.pre_pres_display) })
    return [...set].sort()
  }, [filteredBase, selectedEtapa])

  // ── Filtrado final (incluye precandidato) ──
  const filteredTable = useMemo(() => {
    if (selectedEtapa !== 'Internas' || selectedPrecandidato === 'Todos') return filteredBase
    return filteredBase.filter(r => r.pre_pres_display === selectedPrecandidato)
  }, [filteredBase, selectedPrecandidato, selectedEtapa])

  // ── Datos de clasificación (sobre todos los datos) ──
  const tiposTotales     = useMemo(() => computeTiposTotales(tableData),       [tableData])
  const combinaciones    = useMemo(() => computeCombinaciones(tableData),      [tableData])
  const tiposPorEtapa    = useMemo(() => computeTiposPorEtapa(tableData),      [tableData])
  const tiposPorPartido  = useMemo(() => computeTiposPorPartido(tableData),    [tableData])
  const gastoImpPorTipo  = useMemo(() => computeGastoImpPorTipo(tableData),    [tableData])
  const tiposPorTerr     = useMemo(() => computeTiposPorTerritorio(tableData), [tableData])
  const serieTemporal    = useMemo(() => computeSerieTemporal(tableData),      [tableData])

  // ── Datos del home (sobre filteredTable) ──
  const deptData      = useMemo(() => computeDeptDistribution(filteredTable), [filteredTable])
  const filteredStats = useMemo(() => computeFilteredStats(filteredTable),    [filteredTable])
  const timeSeries    = useMemo(() => computeTimeSeries(filteredTable, lineMetric), [filteredTable, lineMetric])
  const demoData      = useMemo(
    () => adDetails ? computeAggregateDemographicsWithGasto(filteredTable, adDetails) : [],
    [filteredTable, adDetails]
  )
  const gastoGenero = useMemo(
    () => adDetails ? computeGastoGenero(filteredTable, adDetails) : null,
    [filteredTable, adDetails]
  )

  const navigate = (target) => {
    setPage(target)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{ backgroundColor: '#FFFFFF' }}>
      <Header page={page} onNavigate={navigate} />

      {page === 'home' && (
        <PageHome
          filteredTable={filteredTable}
          loadingData={loadingData}
          selectedParties={selectedParties}           setSelectedParties={setSelectedParties}
          selectedEtapa={selectedEtapa}               setSelectedEtapa={handleSetEtapa}
          selectedTerritorio={selectedTerritorio}     setSelectedTerritorio={setSelectedTerritorio}
          selectedDepartamento={selectedDepartamento} setSelectedDepartamento={setSelectedDepartamento}
          selectedPrecandidato={selectedPrecandidato} setSelectedPrecandidato={setSelectedPrecandidato}
          precandidatosList={precandidatosList}
          deptData={deptData}
          filteredStats={filteredStats}
          timeSeries={timeSeries}
          demoData={demoData}
          adDetailsLoading={adDetailsLoading}
          gastoGenero={gastoGenero}
          lineMetric={lineMetric}
          onLineMetricChange={setLineMetric}
          pagePartyMap={pagePartyMap}
        />
      )}
      {page === 'comparacion' && (
        <PageComparacion
          tableData={tableData}
          adDetails={adDetails}
          pagePartyMap={pagePartyMap}
        />
      )}
      {page === 'metodologia' && <PageMetodologia />}
      {page === 'equipo'      && <PageEquipo />}
      {page === 'clasificacion' && (
        <PageTipos
          tiposTotales={tiposTotales}
          combinaciones={combinaciones}
          tiposPorEtapa={tiposPorEtapa}
          tiposPorPartido={tiposPorPartido}
          gastoImpPorTipo={gastoImpPorTipo}
          tiposPorTerritorio={tiposPorTerr}
          serieTemporal={serieTemporal}
          loadingData={loadingData}
        />
      )}

      <Footer page={page} onNavigate={navigate} />
    </div>
  )
}
