import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

const TOOLTIP_STYLE = {
  position: 'fixed',
  background: '#1F2937',
  color: '#F9FAFB',
  padding: '6px 10px',
  borderRadius: '3px',
  fontSize: '12px',
  pointerEvents: 'none',
  zIndex: 9999,
  whiteSpace: 'nowrap',
  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
}

const METRICS = [
  { key: 'anuncios',    label: 'Anuncios',       fmt: v => v.toLocaleString('es-UY'),              fmtShort: v => v.toLocaleString('es-UY') },
  { key: 'gasto',       label: 'Gasto (U$S)',    fmt: v => `U$S ${v.toLocaleString('es-UY')}`,    fmtShort: v => `$${(v / 1000).toFixed(0)}k` },
  { key: 'impresiones', label: 'Impresiones',    fmt: v => v.toLocaleString('es-UY'),              fmtShort: v => `${(v / 1e6).toFixed(1)}M` },
  { key: 'imp_dolar',   label: 'Imp. por dólar', fmt: v => v.toLocaleString('es-UY'),              fmtShort: v => v.toLocaleString('es-UY') },
]

export default function NacionalesBar({ data }) {
  const svgRef       = useRef(null)
  const containerRef = useRef(null)
  const [metric,  setMetric]  = useState('gasto')
  const [tooltip, setTooltip] = useState(null)

  const activeMeta = METRICS.find(m => m.key === metric)

  useEffect(() => {
    if (!data?.length || !svgRef.current || !containerRef.current) return

    const W = containerRef.current.clientWidth
    const margin = { top: 6, right: 120, bottom: 28, left: 130 }
    const w = W - margin.left - margin.right
    const ROW_H = 48
    const h = data.length * ROW_H

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('width', W).attr('height', h + margin.top + margin.bottom)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const sorted = [...data].sort((a, b) => b[metric] - a[metric])
    const maxVal = d3.max(sorted, d => d[metric])

    const x = d3.scaleLinear().domain([0, maxVal * 1.22]).range([0, w])
    const y = d3.scaleBand().domain(sorted.map(d => d.partido)).range([0, h]).padding(0.35)

    // Grid
    g.append('g').selectAll('line')
      .data(x.ticks(5)).enter().append('line')
      .attr('x1', d => x(d)).attr('x2', d => x(d))
      .attr('y1', 0).attr('y2', h)
      .attr('stroke', '#F3F4F6').attr('stroke-width', 1)

    // X axis
    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => activeMeta.fmtShort(d)))
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('.tick line').remove())
      .call(ax => ax.selectAll('text').attr('fill', '#9CA3AF').attr('font-size', '10px'))

    // Y axis: partido name colored
    sorted.forEach(d => {
      g.append('text')
        .attr('x', -8).attr('y', y(d.partido) + y.bandwidth() / 2)
        .attr('text-anchor', 'end').attr('dominant-baseline', 'middle')
        .attr('fill', d.color).attr('font-size', '12px').attr('font-weight', '600')
        .text(d.partido.replace('Partido ', 'P. '))
    })

    // Bars
    sorted.forEach(d => {
      g.append('rect')
        .attr('x', 0)
        .attr('y', y(d.partido))
        .attr('width', x(d[metric]))
        .attr('height', y.bandwidth())
        .attr('fill', d.color)
        .attr('rx', 2)
        .attr('opacity', 0.85)
        .on('mousemove', (event) => {
          setTooltip({
            x: event.clientX, y: event.clientY,
            text: `${d.partido} · ${activeMeta.label}: ${activeMeta.fmt(d[metric])}`,
          })
        })
        .on('mouseleave', () => setTooltip(null))

      g.append('text')
        .attr('x', x(d[metric]) + 6)
        .attr('y', y(d.partido) + y.bandwidth() / 2)
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#4B5563').attr('font-size', '11px').attr('font-family', 'monospace')
        .text(activeMeta.fmtShort(d[metric]))
    })

  }, [data, metric])

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Selector de métrica */}
      <div className="flex flex-wrap gap-2 mb-4">
        {METRICS.map(m => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className="px-3 py-1 text-xs rounded-sm border transition-colors"
            style={metric === m.key
              ? { backgroundColor: '#173363', color: '#fff', borderColor: '#173363' }
              : { borderColor: '#D1D5DB', color: '#6B7280' }
            }
          >
            {m.label}
          </button>
        ))}
      </div>
      <svg ref={svgRef} style={{ display: 'block' }} />
      {tooltip && (
        <div style={{ ...TOOLTIP_STYLE, left: tooltip.x + 14, top: tooltip.y - 36 }}>
          {tooltip.text}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-3 italic">
        Fuente: Bogliaccini et al. (2025), Tabla 3. Período: 1 jul. – 27 oct. 2024.
      </p>
    </div>
  )
}
