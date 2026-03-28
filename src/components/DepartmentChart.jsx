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
  { key: 'impresiones', label: 'Impresiones', fmt: v => v > 1e6 ? (v / 1e6).toFixed(1) + ' M' : v.toLocaleString('es-UY') },
  { key: 'anuncios', label: 'Anuncios', fmt: v => v.toLocaleString('es-UY') },
  { key: 'gasto', label: 'Gasto (U$S)', fmt: v => v.toLocaleString('es-UY') },
]

export default function DepartmentChart({ data }) {
  const svgRef       = useRef(null)
  const containerRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)
  const [metricIdx, setMetricIdx] = useState(0)

  const metric = METRICS[metricIdx]

  useEffect(() => {
    if (!data?.length || !svgRef.current || !containerRef.current) return

    const W = containerRef.current.clientWidth
    const margin = { top: 6, right: 80, bottom: 16, left: 110 }
    const w = W - margin.left - margin.right
    const ROW_H = 20
    const h = data.length * ROW_H

    const sorted = [...data].sort((a, b) => b[metric.key] - a[metric.key])
    const maxVal = d3.max(sorted, d => d[metric.key]) || 1

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('width', W).attr('height', h + margin.top + margin.bottom)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleLinear().domain([0, maxVal * 1.2]).range([0, w])
    const y = d3.scaleBand().domain(sorted.map(d => d.nombre)).range([0, h]).padding(0.22)
    const colorScale = d3.scaleSequential().domain([0, maxVal]).interpolator(d3.interpolateBlues)

    g.append('g')
      .call(d3.axisLeft(y).tickSize(0))
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('text').attr('fill', '#4B5563').attr('font-size', '11px').attr('dx', -4))

    g.selectAll('.bar')
      .data(sorted)
      .enter().append('rect')
      .attr('x', 0)
      .attr('y', d => y(d.nombre))
      .attr('width', d => x(d[metric.key]))
      .attr('height', y.bandwidth())
      .attr('fill', d => colorScale(d[metric.key]))
      .attr('rx', 2)
      .on('mousemove', (event, d) => {
        setTooltip({
          x: event.clientX, y: event.clientY,
          text: `${d.nombre}: ${metric.fmt(d[metric.key])} ${metric.key === 'impresiones' ? 'imp.' : metric.key === 'gasto' ? 'U$S' : 'anuncios'} (${d.pct}%)`,
        })
      })
      .on('mouseleave', () => setTooltip(null))

    g.selectAll('.lbl')
      .data(sorted)
      .enter().append('text')
      .attr('x', d => x(d[metric.key]) + 5)
      .attr('y', d => y(d.nombre) + y.bandwidth() / 2)
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#9CA3AF').attr('font-size', '10px')
      .text(d => metric.fmt(d[metric.key]))

  }, [data, metric])

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        {METRICS.map((m, i) => (
          <button
            key={m.key}
            onClick={() => setMetricIdx(i)}
            className={`text-xs px-2.5 py-1 rounded-sm transition-colors ${
              i === metricIdx
                ? 'text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            style={i === metricIdx ? { backgroundColor: '#0096D1' } : {}}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div ref={containerRef} className="overflow-y-auto" style={{ maxHeight: 380 }}>
        <svg ref={svgRef} style={{ display: 'block' }} />
      </div>
      {tooltip && (
        <div style={{ ...TOOLTIP_STYLE, left: tooltip.x + 14, top: tooltip.y - 36 }}>
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
