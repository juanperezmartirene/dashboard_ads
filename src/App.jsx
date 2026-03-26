import { useState, useMemo } from 'react'
import Header from './components/Header'
import FilterPanel from './components/FilterPanel'
import HorizontalBarChart from './components/HorizontalBarChart'
import StackedAreaChart from './components/StackedAreaChart'
import HeatmapChart from './components/HeatmapChart'
import DepartmentChart from './components/DepartmentChart'
import DataTable from './components/DataTable'
import Footer from './components/Footer'
import { GastoComparativoGlobal, GastoMetaVsTV } from './components/GastoComparativo'
import InternasTable from './components/InternasTable'
import NacionalesBar from './components/NacionalesBar'
import TopCuentas from './components/TopCuentas'
import { TIME_SERIES, TABLE_DATA, ETAPAS } from './data/mockData'
import { computeAdTypes, computeHeatmap, computeDepartamentosForChart } from './data/computeStats'

// ─── Module-level computed stats (update automatically when TABLE_DATA changes) ─
const AD_TYPES      = computeAdTypes(TABLE_DATA)
const PARTIES       = computeHeatmap(TABLE_DATA)
const DEPARTAMENTOS = computeDepartamentosForChart(TABLE_DATA)
import {
  GASTO_META, GASTO_PARTIDO, GASTO_TOTAL_COMPARATIVO,
  INTERNAS_CANDIDATOS, NACIONALES_PARTIDOS, TOP_CUENTAS,
} from './data/gastoData'

// ─── Layout primitives ────────────────────────────────────────────────────────

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

function SectionMeta({ num, label }) {
  return (
    <p className="text-xs font-medium tracking-widest mb-2 uppercase" style={{ color: '#0096D1' }}>
      {String(num).padStart(2, '0')} — {label}
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

function ChartBox({ title, sub, children, gray }) {
  return (
    <div
      className="border border-gray-200 rounded-sm p-6"
      style={{ backgroundColor: gray ? '#F9FAFB' : '#FFFFFF' }}
    >
      <h3 className="text-sm font-semibold text-gray-700 mb-1">{title}</h3>
      {sub && <p className="text-xs text-gray-400 mb-5">{sub}</p>}
      {children}
    </div>
  )
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────

function HomeResultados() {
  return (
    <Section id="resultados" gray>
      <SectionMeta num={1} label="Resultados" />
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Los datos, de un vistazo
        </h2>
        <p className="text-xs text-gray-400 sm:max-w-xs sm:text-right leading-relaxed">
          Corpus completo · Oct 2023 – Nov 2024 · Clasificación automática ROUBERTa (F1: 0,78)
        </p>
      </div>

      <ChartBox
        title="Distribución por tipo de anuncio"
        sub="Cantidad de anuncios clasificados en cada tipo. Un anuncio puede figurar en más de una categoría — los porcentajes no suman 100 %."
      >
        <HorizontalBarChart data={AD_TYPES} />
      </ChartBox>
    </Section>
  )
}

function HomeTemporal() {
  return (
    <Section id="temporal">
      <SectionMeta num={2} label="Evolución temporal" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            La campaña en el tiempo
          </h2>
          <Prose narrow>
            La actividad publicitaria sigue un patrón de aceleración típico de
            las campañas electorales: volumen moderado en la fase inicial,
            crecimiento progresivo hacia las internas de junio, y un pico de
            intensidad pronunciado en las semanas previas a las nacionales de
            octubre.
          </Prose>
        </div>
        <div>
          <Prose>
            La categoría <strong className="text-gray-800">Promoción</strong>{' '}
            domina en todas las etapas y refleja el carácter preferentemente
            positivo de la comunicación política uruguaya. El{' '}
            <strong className="text-gray-800">Ataque</strong>, aunque
            minoritario, muestra un leve repunte hacia el ballottage. La
            categoría <strong className="text-gray-800">CTA</strong> crece
            marcadamente en los tramos finales de cada etapa.
          </Prose>
        </div>
      </div>

      <ChartBox
        title="Volumen semanal de anuncios por tipo"
        sub="Las líneas verticales punteadas marcan las fechas de cada elección. Hacer clic en la leyenda muestra/oculta cada categoría."
      >
        <StackedAreaChart data={TIME_SERIES} etapas={ETAPAS} />
      </ChartBox>
    </Section>
  )
}

function HomePartidosTerritorial() {
  return (
    <Section id="partidos" gray>
      <SectionMeta num={3} label="Partido y territorio" />
      <h2 className="text-2xl font-semibold text-gray-900 mb-8">
        Distintos énfasis, distintas geografías
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartBox
          title="Distribución por tipo según partido — % de anuncios"
          sub="Cada celda muestra la proporción de anuncios de ese tipo en el corpus de ese partido. Clasificación multi-etiqueta."
          gray
        >
          <HeatmapChart parties={PARTIES} />
        </ChartBox>

        <ChartBox
          id="territorial"
          title="Impresiones estimadas por departamento"
          sub="Ordenado de mayor a menor. Hover para ver valores exactos."
        >
          <DepartmentChart data={DEPARTAMENTOS} />
        </ChartBox>
      </div>
    </Section>
  )
}

function HomeDatos({ filteredTable, selectedParties, setSelectedParties, selectedEtapa, setSelectedEtapa, selectedTerritorio, setSelectedTerritorio }) {
  return (
    <Section id="datos">
      <SectionMeta num={4} label="Explorar los datos" />
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Registro de anuncios
        </h2>
        <Prose narrow>
          Explorá el corpus por tipo, partido, etapa y territorio. Usá los
          filtros para buscar combinaciones específicas.
        </Prose>
      </div>

      <FilterPanel
        selectedParties={selectedParties}
        setSelectedParties={setSelectedParties}
        selectedEtapa={selectedEtapa}
        setSelectedEtapa={setSelectedEtapa}
        selectedTerritorio={selectedTerritorio}
        setSelectedTerritorio={setSelectedTerritorio}
      />

      <div className="bg-white border border-gray-200 rounded-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-400">
            {filteredTable.length.toLocaleString('es-UY')} registros con los filtros activos
          </p>
        </div>
        <DataTable data={filteredTable} />
      </div>
    </Section>
  )
}

function PageHome({ filteredTable, selectedParties, setSelectedParties, selectedEtapa, setSelectedEtapa, selectedTerritorio, setSelectedTerritorio }) {
  return (
    <>
      <HomeResultados />
      <HomeTemporal />
      <HomePartidosTerritorial />
      <HomeDatos
        filteredTable={filteredTable}
        selectedParties={selectedParties}    setSelectedParties={setSelectedParties}
        selectedEtapa={selectedEtapa}        setSelectedEtapa={setSelectedEtapa}
        selectedTerritorio={selectedTerritorio} setSelectedTerritorio={setSelectedTerritorio}
      />
    </>
  )
}

// ─── METODOLOGÍA PAGE ─────────────────────────────────────────────────────────

function MetodEstudio() {
  return (
    <Section id="estudio">
      <SectionMeta num={1} label="El estudio" />
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
            ballottage de noviembre.
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
    tipo: 'Promoción', color: '#6366F1', cantidad: 10438, pct: 86.2,
    desc: 'Comunica propuestas, logros y atributos positivos del candidato o partido. El emisor se presenta como solución deseable. Es la categoría más frecuente en todas las etapas.',
  },
  {
    tipo: 'CTA', color: '#3B82F6', cantidad: 7536, pct: 62.3,
    desc: 'Llamado a la acción explícito: votar, compartir, asistir a un acto, seguir en redes. Suele combinar con otras categorías y crece en intensidad hacia el cierre de campaña.',
  },
  {
    tipo: 'Tema', color: '#10B981', cantidad: 5782, pct: 47.8,
    desc: 'Posiciona al candidato respecto a un issue específico: seguridad, salud, educación, economía. Permite identificar las agendas temáticas de cada partido.',
  },
  {
    tipo: 'Imagen', color: '#F59E0B', cantidad: 3226, pct: 26.7,
    desc: 'Construye la imagen personal del candidato apelando a atributos humanizantes: familia, trayectoria, valores, cercanía. Predomina en las primeras etapas de la campaña.',
  },
  {
    tipo: 'Ceremonial', color: '#8B5CF6', cantidad: 2131, pct: 17.6,
    desc: 'Vinculado a fechas especiales o efemérides (Día del Trabajo, independencia, etc.). Tono celebratorio y bajo contenido político directo. Refleja presencia continua en el espacio digital.',
  },
  {
    tipo: 'Ataque', color: '#EF4444', cantidad: 1398, pct: 11.6,
    desc: 'Crítica o contraste con adversarios: señala aspectos negativos de la oposición, su gestión o sus propuestas. Es la categoría menos frecuente del corpus uruguayo.',
  },
]

function MetodTipologia() {
  return (
    <Section id="tipologia" gray>
      <SectionMeta num={2} label="La tipología" />
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

      <ChartBox
        title="Frecuencia por categoría"
        sub="Cantidad de anuncios clasificados en cada tipo. Un anuncio puede figurar en más de una categoría."
      >
        <HorizontalBarChart data={AD_TYPES} />
      </ChartBox>
    </Section>
  )
}

const TIMELINE = [
  { label: 'Inicio del período', date: 'Oct 2023',    sub: '12.096 anuncios' },
  { label: 'Elecciones Internas', date: '30 Jun 2024', sub: '6.192 anuncios'  },
  { label: 'Elecciones Nacionales', date: '27 Oct 2024', sub: '5.547 anuncios' },
  { label: 'Ballottage',          date: '24 Nov 2024', sub: '357 anuncios'   },
]

function MetodCorpus() {
  return (
    <Section id="corpus">
      <SectionMeta num={3} label="El corpus" />
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
            ballottage.
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
        <SectionMeta num={1} label="El equipo" />
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
              Los datos presentados son sintéticos y serán reemplazados por el corpus
              real al finalizar el procesamiento. Última actualización: 24/03/2026.
            </p>
          </div>
        </div>
      </div>
    </Section>
  )
}

// ─── GASTOS PAGE ──────────────────────────────────────────────────────────────

const HALLAZGOS = [
  {
    icono: '📊',
    titulo: 'Uso intensivo y concentrado',
    texto: 'FA, PN y PC acumulan más del 85 % de los anuncios, impresiones y gasto. Dentro de cada partido existen también disparidades significativas entre candidaturas.',
  },
  {
    icono: '💰',
    titulo: 'Meta: el 31 % del gasto en TV',
    texto: 'El gasto total en Meta (U$S 1.293.638) representa el 31 % de lo gastado en televisión abierta y solo el 3 % del total declarado por los partidos.',
  },
  {
    icono: '📍',
    titulo: 'Maldonado supera a Canelones',
    texto: 'En el interior, Maldonado concentra más anuncios que Canelones en ambas etapas. Esto refleja la competencia interna del PN y los recursos disponibles en ese departamento.',
  },
  {
    icono: '👥',
    titulo: 'Foco en jóvenes de 25–34 años',
    texto: 'El tramo de 25 a 34 años concentra el 26–28 % de todas las impresiones. Las mujeres de ese tramo reciben una proporción levemente mayor de publicidad.',
  },
]

function GastoHallazgos() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      {HALLAZGOS.map((h, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-sm p-5">
          <p className="text-lg mb-2">{h.icono}</p>
          <p className="text-sm font-semibold text-gray-800 mb-1">{h.titulo}</p>
          <p className="text-xs text-gray-500 leading-relaxed">{h.texto}</p>
        </div>
      ))}
    </div>
  )
}

function GastoKPIs() {
  const kpis = [
    { label: 'Anuncios analizados',   value: '12.976',       sub: 'Internas + primera vuelta nacional' },
    { label: 'Gasto total en Meta',   value: 'U$S 1.293.638', sub: 'FA + PN + PC · oct. 2023 – oct. 2024' },
    { label: 'Cuentas anunciantes',   value: '514 / 442',    sub: 'Internas / Nacionales' },
    { label: 'Total impresiones',     value: '979 M',         sub: 'Promedio estimado (internas + nacionales)' },
  ]
  const accents = ['#173363', '#0096D1', '#10B981', '#6366F1']
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
      {kpis.map((k, i) => (
        <div
          key={k.label}
          className="bg-white border border-gray-200 rounded-sm px-4 py-4 md:px-6 md:py-5"
          style={{ borderTop: `3px solid ${accents[i]}` }}
        >
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2 leading-snug">{k.label}</p>
          <p className="font-mono font-bold text-gray-900 leading-none mb-2 truncate" style={{ fontSize: '1.35rem' }}>{k.value}</p>
          <p className="text-xs text-gray-400 leading-snug">{k.sub}</p>
        </div>
      ))}
    </div>
  )
}

function PageGastos() {
  return (
    <>
      {/* ── Sección 1: Contexto del gasto ── */}
      <Section id="gasto-contexto" gray>
        <SectionMeta num={1} label="El gasto en contexto" />
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            ¿Cuánto y cómo gastan los partidos en Meta?
          </h2>
          <p className="text-xs text-gray-400 sm:max-w-xs sm:text-right leading-relaxed">
            Bogliaccini, Fynn, Piñeiro-Rodríguez & Rosenblatt (2025) · 12.976 anuncios
          </p>
        </div>

        <GastoHallazgos />
        <GastoKPIs />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartBox
            title="Comparativo de gasto: Meta en perspectiva"
            sub="Gasto total en Meta (internas + nacionales) versus otras categorías de gasto declarado."
          >
            <GastoComparativoGlobal data={GASTO_TOTAL_COMPARATIVO} />
          </ChartBox>

          <ChartBox
            title="Gasto en Meta vs. gasto en televisión por partido"
            sub='El porcentaje indica qué fracción del gasto en TV representa el gasto total en Meta. Elecciones nacionales (primera vuelta).'
          >
            <GastoMetaVsTV data={GASTO_PARTIDO} />
          </ChartBox>
        </div>
      </Section>

      {/* ── Sección 2: Elecciones internas ── */}
      <Section id="gasto-internas">
        <SectionMeta num={2} label="Elecciones internas" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              La interna más desigual: el PN
            </h2>
            <Prose narrow>
              Durante las elecciones internas (oct. 2023 – jun. 2024) se publicaron
              6.955 anuncios. El PN concentró casi la mitad (49,9 %), seguido del FA
              (24,9 %) y el PC (17,1 %). Álvaro Delgado casi duplicó en anuncios a
              Laura Raffo y triplicó su gasto, reflejando la disparidad interna del PN.
            </Prose>
          </div>
          <div>
            <Prose>
              En contraste, dentro del FA las proporciones de gasto de Orsi y Cosse
              fueron similares (46,4 % vs 48,9 %). El PC presentó una interna más
              fragmentada con cuatro candidatos relevantes. El total de impresiones
              superó los 515 millones de visualizaciones promedio.
            </Prose>
          </div>
        </div>

        <ChartBox
          title="Anuncios, impresiones y gasto por precandidato — elecciones internas 2024"
          sub="Hacé clic en el encabezado de cada columna para ordenar. Las barras muestran el valor relativo dentro del corpus."
          gray
        >
          <InternasTable data={INTERNAS_CANDIDATOS} />
        </ChartBox>
      </Section>

      {/* ── Sección 3: Elecciones nacionales ── */}
      <Section id="gasto-nacionales" gray>
        <SectionMeta num={3} label="Elecciones nacionales" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              El FA logra más alcance con menos gasto
            </h2>
            <Prose narrow>
              En la primera vuelta (jul.–oct. 2024) el PN lideró en volumen de
              anuncios (2.461) y gasto (U$S 285.107). Sin embargo, el FA obtuvo más
              impresiones (184,6 M) que el PN (143,9 M), a pesar de gastar menos,
              con una eficiencia de 710 impresiones por dólar frente a 505 del PN.
            </Prose>
          </div>
          <div>
            <Prose>
              Esta diferencia sugiere estrategias publicitarias distintas: el FA apostó
              a anuncios de mayor duración o mejor segmentación, mientras que el PN
              concentró su pauta en el período más intenso de campaña. El PC, pese a
              tener menos anuncios que el FA, logró impresiones comparables en las
              internas por mantener anuncios activos por más tiempo.
            </Prose>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartBox
            title="Resultados por partido — elecciones nacionales"
            sub="Seleccioná la métrica para comparar partidos. Primera vuelta, jul.–oct. 2024."
          >
            <NacionalesBar data={NACIONALES_PARTIDOS} />
          </ChartBox>

          <ChartBox
            title="Top 5 cuentas por anuncios, gasto e impresiones"
            sub="Elecciones nacionales (primera vuelta). Las impresiones son promedios de rangos reportados por Meta."
          >
            <TopCuentas data={TOP_CUENTAS} />
          </ChartBox>
        </div>
      </Section>
    </>
  )
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState('home')
  const [selectedParties,    setSelectedParties]    = useState([])
  const [selectedEtapa,      setSelectedEtapa]      = useState('Todas')
  const [selectedTerritorio, setSelectedTerritorio] = useState([])

  const filteredTable = useMemo(() => {
    let rows = TABLE_DATA
    if (selectedParties.length > 0)
      rows = rows.filter(r => selectedParties.includes(r.part_org))
    if (selectedTerritorio.length > 0)
      rows = rows.filter(r => selectedTerritorio.includes(r.departamento_nacional))
    return rows
  }, [selectedParties, selectedTerritorio])

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
          selectedParties={selectedParties}    setSelectedParties={setSelectedParties}
          selectedEtapa={selectedEtapa}        setSelectedEtapa={setSelectedEtapa}
          selectedTerritorio={selectedTerritorio} setSelectedTerritorio={setSelectedTerritorio}
        />
      )}
      {page === 'metodologia' && <PageMetodologia />}
      {page === 'equipo'      && <PageEquipo />}
      {page === 'gastos'      && <PageGastos />}

      <Footer page={page} onNavigate={navigate} />
    </div>
  )
}
