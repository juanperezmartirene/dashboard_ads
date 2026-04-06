import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { TIPOS_META } from '../data/processRealData'

// ─── Layout primitives (copiados de App.jsx) ──────────────────────────────────
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
function ChartBox({ title, sub, children, gray }) {
  return (
    <div className="border border-gray-200 rounded-sm p-6" style={{ backgroundColor: gray ? '#F9FAFB' : '#FFFFFF' }}>
      <h3 className="text-sm font-semibold text-gray-700 mb-1">{title}</h3>
      {sub && <p className="text-xs text-gray-400 mb-5">{sub}</p>}
      {children}
    </div>
  )
}

// ─── Leyenda de tipos ─────────────────────────────────────────────────────────
function Leyenda({ tipos = TIPOS_META, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-x-4 gap-y-1.5 ${className}`}>
      {tipos.map(t => (
        <div key={t.key} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm inline-block shrink-0" style={{ backgroundColor: t.color }} />
          <span className="text-xs text-gray-500">{t.label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Viz 1: Barras horizontales — totales por tipo ────────────────────────────
function TiposTotalesChart({ data }) {
  if (!data || !data.length) return null
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div className="space-y-3">
      {data.map(d => (
        <div key={d.key}>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-36 shrink-0">{d.label}</span>
            <div className="flex-1 bg-gray-100 rounded-sm h-6 relative overflow-hidden">
              <div
                className="h-full rounded-sm"
                style={{ width: `${(d.count / max) * 100}%`, backgroundColor: d.color }}
              />
            </div>
            <span className="text-xs font-mono text-gray-600 w-20 text-right shrink-0">
              {d.count.toLocaleString('es-UY')}
            </span>
          </div>
          <div className="ml-[9.5rem] mt-0.5">
            <span className="text-xs text-gray-400">
              {d.total > 0 ? ((d.count / d.total) * 100).toFixed(1) : 0}% del corpus
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Viz 2: Barras horizontales — combinaciones ───────────────────────────────
function CombinacionesChart({ data }) {
  if (!data || !data.length) return null
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div className="space-y-3">
      {data.map(d => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-44 shrink-0">{d.label}</span>
          <div className="flex-1 bg-gray-100 rounded-sm h-7 relative overflow-hidden">
            <div
              className="h-full rounded-sm"
              style={{ width: `${(d.count / max) * 100}%`, backgroundColor: d.color }}
            />
          </div>
          <span className="text-xs font-mono text-gray-600 w-16 text-right shrink-0">
            {d.count.toLocaleString('es-UY')}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Viz 3 y 4 y 6: Barras agrupadas (% por grupo) ───────────────────────────
function GroupedPercentChart({ groups, groupKey, groupLabel = g => g }) {
  if (!groups || !groups.length) return null

  return (
    <div className="space-y-5">
      {groups.map(g => {
        const label = groupLabel(g[groupKey])
        return (
          <div key={label}>
            <p className="text-xs font-semibold text-gray-600 mb-1.5">{label}</p>
            <div className="flex gap-px h-7 rounded-sm overflow-hidden w-full">
              {g.tipos.map(t => (
                t.pct > 0 && (
                  <div
                    key={t.key}
                    style={{ width: `${t.pct}%`, backgroundColor: t.color, minWidth: t.pct > 2 ? undefined : '2px' }}
                    title={`${t.label}: ${t.pct}%`}
                    className="relative group flex-shrink-0"
                  >
                    {t.pct >= 8 && (
                      <span className="absolute inset-0 flex items-center justify-center text-white font-mono"
                        style={{ fontSize: '10px' }}>
                        {t.pct}%
                      </span>
                    )}
                  </div>
                )
              ))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
              {g.tipos.filter(t => t.pct > 0).map(t => (
                <span key={t.key} className="text-xs text-gray-400">
                  {t.label}: {t.pct}%
                </span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Viz 5: 100% stacked horizontal — gasto e impresiones por tipo por partido ─
function StackedPctChart({ parties, metric }) {
  // metric: 'pctGasto' | 'pctImp'
  if (!parties || !parties.length) return null

  return (
    <div className="space-y-4">
      {parties.map(p => {
        // Normalize so bars sum to ~100%
        const total = p.tipos.reduce((s, t) => s + (t[metric] || 0), 0)
        return (
          <div key={p.partido}>
            <p className="text-xs font-semibold text-gray-600 mb-1">{p.short}</p>
            <div className="flex gap-px h-6 rounded-sm overflow-hidden w-full">
              {p.tipos.map(t => {
                const pct = total > 0 ? (t[metric] / total) * 100 : 0
                return pct > 0 ? (
                  <div
                    key={t.key}
                    style={{ width: `${pct}%`, backgroundColor: t.color, minWidth: '2px' }}
                    title={`${t.label}: ${t[metric]}%`}
                    className="flex-shrink-0"
                  />
                ) : null
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Viz 6 (serie temporal): Área apilada con D3 ─────────────────────────────
function SerieTemporalChart({ data }) {
  const svgRef = useRef(null)

  useEffect(() => {
    if (!data || !data.length || !svgRef.current) return

    const container = svgRef.current.parentElement
    const W = container.clientWidth || 800
    const H = 240
    const margin = { top: 10, right: 20, bottom: 40, left: 40 }
    const w = W - margin.left - margin.right
    const h = H - margin.top - margin.bottom

    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', W)
      .attr('height', H)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Elecciones marcadores
    const markers = [
      { fecha: '2024-06', label: 'Internas' },
      { fecha: '2024-10', label: 'Nacionales' },
      { fecha: '2024-11', label: 'Ballottage' },
    ]

    const keys = TIPOS_META.map(t => t.key)
    const colorMap = Object.fromEntries(TIPOS_META.map(t => [t.key, t.color]))

    const stack = d3.stack().keys(keys)(data)

    // x scale: months as ordinal
    const x = d3.scaleBand()
      .domain(data.map(d => d.fecha))
      .range([0, w])
      .padding(0.05)

    const maxY = d3.max(stack[stack.length - 1], d => d[1]) || 1
    const y = d3.scaleLinear().domain([0, maxY]).range([h, 0]).nice()

    // Bars
    stack.forEach((layer) => {
      svg.selectAll(`.bar-${layer.key}`)
        .data(layer)
        .join('rect')
        .attr('x', d => x(d.data.fecha))
        .attr('y', d => y(d[1]))
        .attr('height', d => Math.max(0, y(d[0]) - y(d[1])))
        .attr('width', x.bandwidth())
        .attr('fill', colorMap[layer.key] || '#ccc')
        .attr('opacity', 0.85)
    })

    // Election markers
    markers.forEach(m => {
      const xPos = x(m.fecha)
      if (xPos == null) return
      svg.append('line')
        .attr('x1', xPos + x.bandwidth() / 2)
        .attr('x2', xPos + x.bandwidth() / 2)
        .attr('y1', 0).attr('y2', h)
        .attr('stroke', '#173363')
        .attr('stroke-dasharray', '4,3')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.6)
      svg.append('text')
        .attr('x', xPos + x.bandwidth() / 2 + 3)
        .attr('y', 10)
        .attr('fill', '#173363')
        .attr('font-size', '9px')
        .text(m.label)
    })

    // x axis — show only some ticks
    const allFechas = data.map(d => d.fecha)
    const tickFechas = allFechas.filter((f, i) => i === 0 || i === allFechas.length - 1 || f.endsWith('-01') || f.endsWith('-06') || f.endsWith('-10') || f.endsWith('-11'))

    svg.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(
        d3.axisBottom(x)
          .tickValues(tickFechas)
          .tickFormat(d => {
            const [y, m] = d.split('-')
            const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
            return `${months[parseInt(m)-1]} ${y.slice(2)}`
          })
      )
      .call(g => {
        g.select('.domain').remove()
        g.selectAll('.tick line').remove()
        g.selectAll('text').attr('font-size', '10px').attr('fill', '#9CA3AF')
      })

    svg.append('g')
      .call(d3.axisLeft(y).ticks(4).tickFormat(d => d > 999 ? `${d/1000}k` : d))
      .call(g => {
        g.select('.domain').remove()
        g.selectAll('.tick line').attr('stroke', '#E5E7EB').attr('x2', w)
        g.selectAll('text').attr('font-size', '10px').attr('fill', '#9CA3AF')
      })

  }, [data])

  return <svg ref={svgRef} style={{ display: 'block', width: '100%' }} />
}

// ─── Tabla de métricas del modelo ─────────────────────────────────────────────
const MODEL_METRICS = [
  { cat: 'Promoción',          prec: '0,78', rec: '0,96', f1: '0,86' },
  { cat: 'Ataque',             prec: '0,68', rec: '0,41', f1: '0,51' },
  { cat: 'Imagen',             prec: '0,71', rec: '0,59', f1: '0,65' },
  { cat: 'Tema',               prec: '0,71', rec: '0,81', f1: '0,76' },
  { cat: 'Llamado a la acción',prec: '0,55', rec: '0,90', f1: '0,68' },
  { cat: 'Ceremonial',         prec: '0,82', rec: '0,70', f1: '0,75' },
]

function ModelMetricsTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 pr-4 font-semibold text-gray-600">Categoría</th>
            <th className="text-right py-2 px-3 font-semibold text-gray-600">Precisión</th>
            <th className="text-right py-2 px-3 font-semibold text-gray-600">Recall</th>
            <th className="text-right py-2 px-3 font-semibold text-gray-600">F1</th>
          </tr>
        </thead>
        <tbody>
          {MODEL_METRICS.map(r => (
            <tr key={r.cat} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-2 pr-4 text-gray-700">{r.cat}</td>
              <td className="py-2 px-3 text-right font-mono text-gray-600">{r.prec}</td>
              <td className="py-2 px-3 text-right font-mono text-gray-600">{r.rec}</td>
              <td className="py-2 px-3 text-right font-mono text-gray-600">{r.f1}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-200">
            <td className="py-2 pr-4 text-gray-400 italic">Macro F1</td>
            <td colSpan={2} />
            <td className="py-2 px-3 text-right font-mono font-semibold text-gray-700">0,75</td>
          </tr>
          <tr>
            <td className="py-2 pr-4 text-gray-400 italic">Micro F1</td>
            <td colSpan={2} />
            <td className="py-2 px-3 text-right font-mono font-semibold text-gray-700">0,78</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ─── Loading state ────────────────────────────────────────────────────────────
function Loading() {
  return (
    <Section>
      <div className="flex items-center justify-center py-16 gap-3">
        <div className="w-5 h-5 rounded-full border-2 border-gray-200 animate-spin" style={{ borderTopColor: '#0096D1' }} />
        <span className="text-sm text-gray-400">Cargando datos...</span>
      </div>
    </Section>
  )
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function PageTipos({
  tiposTotales, combinaciones, tiposPorEtapa,
  tiposPorPartido, gastoImpPorTipo, tiposPorTerritorio,
  serieTemporal, loadingData,
}) {
  const [metricaGasto, setMetricaGasto] = useState('pctGasto')

  if (loadingData) return <Loading />

  const totalClasificados = tiposTotales?.[0]?.total ?? 0

  return (
    <>
      {/* ── Sección 1: Clasificación y metodología ── */}
      <Section id="clasif-intro" gray>
        <SectionMeta num={1} label="Clasificación de anuncios" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-10">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Seis tipos de mensajes electorales
            </h2>
            <p className="text-sm leading-7 text-gray-600">
              Se clasificaron <strong className="text-gray-800">{totalClasificados.toLocaleString('es-UY')} anuncios</strong> según
              la tipología propuesta por Stromer-Galley et al. (2021), que distingue seis funciones
              comunicacionales no excluyentes: un mismo anuncio puede pertenecer a más de una categoría.
              La clasificación automática se realizó con el modelo <strong className="text-gray-800">ROUBERTa</strong> (Filevich et al., 2024),
              pre-entrenado sobre textos de prensa uruguaya.
            </p>
            <p className="text-sm leading-7 text-gray-600 mt-3">
              Para entrenar el modelo, dos codificadores etiquetaron manualmente 1.000 anuncios
              de entrenamiento y 236 de validación, estratificados por partido y etapa electoral.
              El umbral de clasificación (0,36) fue seleccionado para maximizar el F1 global.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Métricas de evaluación del modelo por tipo de anuncio
            </h3>
            <ModelMetricsTable />
            <p className="text-xs text-gray-400 mt-3 leading-relaxed italic">
              Fuente: Elaboración propia. Las categorías con mayor ambigüedad semántica y menor representación
              en el corpus de entrenamiento, como Ataque, presentan valores de F1 más bajos.
            </p>
          </div>
        </div>

        {/* Leyenda de tipos */}
        <div className="bg-white border border-gray-200 rounded-sm p-5 mb-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Descripción de los tipos
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {TIPOS_META.map(t => (
              <div key={t.key} className="flex gap-3">
                <span
                  className="w-3 h-3 rounded-sm shrink-0 mt-0.5"
                  style={{ backgroundColor: t.color }}
                />
                <div>
                  <p className="text-xs font-semibold text-gray-700">{t.label}</p>
                  <p className="text-xs text-gray-400 leading-relaxed mt-0.5">
                    {t.key === 'advocacy' && 'Comunica propuestas, logros y atributos positivos. Estrategia predominante en todo el ciclo.'}
                    {t.key === 'cta' && 'Llamado explícito a votar, compartir, asistir o seguir. Segunda categoría más frecuente.'}
                    {t.key === 'issue' && 'Posiciona al candidato respecto a temas de política pública: seguridad, salud, economía.'}
                    {t.key === 'image' && 'Construye imagen personal del candidato: valores, familia, trayectoria, cercanía.'}
                    {t.key === 'ceremonial' && 'Vinculado a fechas especiales o efemérides. Tono celebratorio, bajo contenido político directo.'}
                    {t.key === 'atack' && 'Crítica explícita a adversarios. La categoría menos frecuente del corpus uruguayo.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Sección 2: Resultados generales ── */}
      <Section id="clasif-totales">
        <SectionMeta num={2} label="Distribución general" />
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            ¿Cuántos anuncios hay de cada tipo?
          </h2>
          <p className="text-xs text-gray-400 sm:text-right leading-relaxed">
            Las categorías no son excluyentes · {totalClasificados.toLocaleString('es-UY')} anuncios clasificados
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ChartBox
            title="Frecuencia por categoría"
            sub="Cantidad de anuncios clasificados en cada tipo. Un anuncio puede figurar en más de una categoría."
          >
            <TiposTotalesChart data={tiposTotales} />
          </ChartBox>

          <ChartBox
            title="Combinaciones de tipos de contenido"
            sub="Frecuencia de anuncios que combinan enfoque (Promoción/Ataque) con objeto (Programático/Imagen)."
          >
            <CombinacionesChart data={combinaciones} />
            <p className="text-xs text-gray-400 mt-4 leading-relaxed">
              Los ataques se articulan casi exclusivamente sobre contenidos programáticos.
              Las estrategias de promoción usan más propuestas temáticas que imagen personal.
            </p>
          </ChartBox>
        </div>
      </Section>

      {/* ── Sección 3: Evolución temporal ── */}
      <Section id="clasif-temporal" gray>
        <SectionMeta num={3} label="Evolución temporal" />
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Tipos de anuncios a lo largo del ciclo electoral
          </h2>
          <p className="text-sm leading-7 text-gray-600 max-w-2xl">
            La cantidad de anuncios activos aumenta antes de cada elección y cae abruptamente después.
            La proporción entre tipos se mantiene estable a lo largo del ciclo, sin variaciones significativas
            entre etapas, lo que indica que las reglas específicas de cada instancia electoral no condicionan
            el mix de mensajes.
          </p>
        </div>

        <ChartBox
          title="Anuncios publicados por mes y tipo"
          sub="Cantidad de anuncios por mes de publicación. Las líneas verticales marcan las fechas electorales."
        >
          <SerieTemporalChart data={serieTemporal} />
          <div className="mt-4">
            <Leyenda />
          </div>
        </ChartBox>
      </Section>

      {/* ── Sección 4: Por etapa y partido ── */}
      <Section id="clasif-etapa-partido">
        <SectionMeta num={4} label="Por etapa y partido" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          ¿Cambia la estrategia según la etapa o el partido?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ChartBox
            title="Distribución proporcional por etapa electoral"
            sub="Porcentaje de anuncios de cada tipo dentro de cada etapa del ciclo."
          >
            <GroupedPercentChart
              groups={tiposPorEtapa}
              groupKey="etapa"
              groupLabel={g => g}
            />
            <p className="text-xs text-gray-400 mt-4 leading-relaxed">
              La distribución se mantiene estable. La Promoción representa ~35% en las tres etapas.
              El Llamado a la acción es más frecuente en Internas y Nacionales que en el Ballottage.
            </p>
          </ChartBox>

          <ChartBox
            title="Distribución proporcional por partido político"
            sub="Porcentaje de anuncios de cada tipo dentro de cada partido."
          >
            <GroupedPercentChart
              groups={tiposPorPartido}
              groupKey="partido"
              groupLabel={g => {
                const map = { 'Partido Nacional': 'Partido Nacional', 'Frente Amplio': 'Frente Amplio', 'Partido Colorado': 'Partido Colorado', 'Otros': 'Otros' }
                return map[g] || g
              }}
            />
            <p className="text-xs text-gray-400 mt-4 leading-relaxed">
              Las diferencias entre partidos son pequeñas. El FA es el partido que más ataca,
              acorde a su rol como oposición. El PN concentra más anuncios de Promoción.
            </p>
          </ChartBox>
        </div>

        <Leyenda className="justify-center" />
      </Section>

      {/* ── Sección 5: Gasto e impresiones ── */}
      <Section id="clasif-gasto-imp" gray>
        <SectionMeta num={5} label="Gasto e impresiones por tipo" />
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              ¿El algoritmo favorece algún tipo de mensaje?
            </h2>
            <p className="text-sm leading-7 text-gray-600 max-w-2xl">
              La distribución proporcional del gasto y las impresiones por tipo de anuncio
              sigue patrones similares entre partidos, lo que sugiere que el algoritmo
              de Meta no favorece sistemáticamente ninguna categoría de contenido.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setMetricaGasto('pctGasto')}
              className="text-xs px-3 py-1.5 rounded-sm border font-medium transition-colors"
              style={metricaGasto === 'pctGasto'
                ? { backgroundColor: '#0096D1', color: '#fff', borderColor: '#0096D1' }
                : { backgroundColor: '#fff', color: '#6B7280', borderColor: '#D1D5DB' }}
            >
              Gasto
            </button>
            <button
              onClick={() => setMetricaGasto('pctImp')}
              className="text-xs px-3 py-1.5 rounded-sm border font-medium transition-colors"
              style={metricaGasto === 'pctImp'
                ? { backgroundColor: '#0096D1', color: '#fff', borderColor: '#0096D1' }
                : { backgroundColor: '#fff', color: '#6B7280', borderColor: '#D1D5DB' }}
            >
              Impresiones
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartBox
            title={metricaGasto === 'pctGasto' ? 'Gasto estimado por tipo — proporción dentro del partido' : 'Impresiones estimadas por tipo — proporción dentro del partido'}
            sub="Distribución proporcional. Cada barra representa el 100% del gasto/impresiones de ese partido."
          >
            <StackedPctChart parties={gastoImpPorTipo} metric={metricaGasto} />
            <div className="mt-4">
              <Leyenda />
            </div>
          </ChartBox>

          <ChartBox
            title="Distribución proporcional por territorio"
            sub="Porcentaje de anuncios de cada tipo según el alcance del anunciante."
          >
            <GroupedPercentChart
              groups={tiposPorTerritorio}
              groupKey="territorio"
              groupLabel={g => g}
            />
            <p className="text-xs text-gray-400 mt-4 leading-relaxed">
              Los anunciantes del Interior muestran mayor presencia de Ceremoniales y Llamados
              a la acción, probablemente por la promoción de actos y eventos locales.
            </p>
            <div className="mt-3">
              <Leyenda />
            </div>
          </ChartBox>
        </div>
      </Section>

      {/* ── Sección 6: Explorar anuncios ── */}
      <Section id="tipos-conclusiones">
        <SectionMeta num={6} label="Hallazgos principales" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-0">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-5">
              Una campaña estable y poco confrontacional
            </h2>
            <p className="text-sm leading-7 text-gray-600">
              Los tipos de anuncios se mantuvieron estables a lo largo de todo el ciclo electoral,
              sin grandes variaciones entre etapas, partidos o territorios. Esto sugiere que las
              reglas y objetivos específicos de cada instancia (internas, nacionales, ballottage)
              no condicionaron significativamente el mix de mensajes.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { titulo: 'Promoción dominante', texto: 'Los anuncios de Promoción representan ~35% del total en las tres etapas. La campaña digital se caracterizó por contenidos positivos orientados a consolidar apoyo.' },
              { titulo: 'Bajo nivel de ataques', texto: 'Los anuncios de Ataque fueron minoritarios en todos los partidos, acorde a la política uruguaya, poco polarizada en términos afectivos.' },
              { titulo: 'Ataques programáticos', texto: 'Cuando se ataca, se hace sobre contenidos programáticos y temáticos. Las combinaciones Ataque + Imagen son casi nulas.' },
              { titulo: 'Interior: más ceremonial y CTA', texto: 'Los anunciantes del Interior tienen mayor proporción de anuncios Ceremoniales y de Llamado a la acción, posiblemente por la promoción de actos locales.' },
            ].map((h, i) => (
              <div key={i} className="border-l-2 border-gray-200 pl-4">
                <p className="text-sm font-semibold text-gray-800 mb-0.5">{h.titulo}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{h.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  )
}
