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

export default function DepartmentChart({ data }) {
  const svgRef       = useRef(null)
  const containerRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    if (!data?.length || !svgRef.current || !containerRef.current) return

    const W = containerRef.current.clientWidth
    const margin = { top: 6, right: 70, bottom: 16, left: 110 }
    const w = W - margin.left - margin.right
    const ROW_H = 20
    const h = data.length * ROW_H

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('width', W).attr('height', h + margin.top + margin.bottom)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.impresiones) * 1.2])
      .range([0, w])

    const y = d3.scaleBand()
      .domain(data.map(d => d.nombre))
      .range([0, h])
      .padding(0.22)

    const colorScale = d3.scaleSequential()
      .domain([0, d3.max(data, d => d.impresiones)])
      .interpolator(d3.interpolateBlues)

    // Y axis
    g.append('g')
      .call(d3.axisLeft(y).tickSize(0))
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('text')
        .attr('fill', '#4B5563').attr('font-size', '11px').attr('dx', -4)
      )

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('x', 0)
      .attr('y', d => y(d.nombre))
      .attr('width', d => x(d.impresiones))
      .attr('height', y.bandwidth())
      .attr('fill', d => colorScale(d.impresiones))
      .attr('rx', 2)
      .on('mousemove', (event, d) => {
        setTooltip({
          x: event.clientX, y: event.clientY,
          text: `${d.nombre}: ${d.impresiones.toLocaleString('es-UY')} imp. (${d.pct}%)`,
        })
      })
      .on('mouseleave', () => setTooltip(null))

    // Value labels
    g.selectAll('.lbl')
      .data(data)
      .enter().append('text')
      .attr('x', d => x(d.impresiones) + 5)
      .attr('y', d => y(d.nombre) + y.bandwidth() / 2)
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#9CA3AF').attr('font-size', '10px')
      .text(d => `${d.pct}%`)

  }, [data])

  return (
    <div>
      <p className="text-xs text-gray-300 italic mb-2">
        Nota: visualización de barras. El mapa coroplético se activará al integrar el GeoJSON de Uruguay.
      </p>
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
