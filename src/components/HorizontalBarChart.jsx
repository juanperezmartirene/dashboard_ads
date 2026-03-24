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

export default function HorizontalBarChart({ data }) {
  const svgRef       = useRef(null)
  const containerRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    if (!data?.length || !svgRef.current || !containerRef.current) return

    const W = containerRef.current.clientWidth
    const margin = { top: 6, right: 170, bottom: 28, left: 90 }
    const w = W - margin.left - margin.right
    const ROW_H = 44
    const h = data.length * ROW_H

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('width', W).attr('height', h + margin.top + margin.bottom)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const sorted = [...data].sort((a, b) => b.cantidad - a.cantidad)

    const x = d3.scaleLinear()
      .domain([0, d3.max(sorted, d => d.cantidad) * 1.18])
      .range([0, w])

    const y = d3.scaleBand()
      .domain(sorted.map(d => d.tipo))
      .range([0, h])
      .padding(0.38)

    // Light grid
    g.append('g')
      .selectAll('line')
      .data(x.ticks(5))
      .enter().append('line')
      .attr('x1', d => x(d)).attr('x2', d => x(d))
      .attr('y1', 0).attr('y2', h)
      .attr('stroke', '#F3F4F6').attr('stroke-width', 1)

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(
        d3.axisBottom(x).ticks(5).tickFormat(d => d.toLocaleString('es-UY'))
      )
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('.tick line').remove())
      .call(ax => ax.selectAll('text').attr('fill', '#9CA3AF').attr('font-size', '10px'))

    // Y axis labels (hand-placed for full control)
    sorted.forEach(d => {
      // Type name
      g.append('text')
        .attr('x', -8).attr('y', y(d.tipo) + y.bandwidth() / 2 - 3)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#374151')
        .attr('font-size', '12px')
        .attr('font-weight', '500')
        .text(d.tipo)

      // F1 score badge
      g.append('text')
        .attr('x', -8).attr('y', y(d.tipo) + y.bandwidth() / 2 + 11)
        .attr('text-anchor', 'end')
        .attr('fill', '#9CA3AF')
        .attr('font-size', '9px')
        .text(`F1 ${d.f1}`)
    })

    // Bars
    g.selectAll('.bar')
      .data(sorted)
      .enter().append('rect')
      .attr('x', 0)
      .attr('y', d => y(d.tipo))
      .attr('width', d => x(d.cantidad))
      .attr('height', y.bandwidth())
      .attr('fill', d => d.color)
      .attr('rx', 2)
      .style('cursor', 'default')
      .on('mousemove', (event, d) => {
        setTooltip({
          x: event.clientX,
          y: event.clientY,
          text: `${d.tipo}: ${d.cantidad.toLocaleString('es-UY')} anuncios (${d.pct}%) · F1: ${d.f1}`,
        })
      })
      .on('mouseleave', () => setTooltip(null))

    // Value labels
    sorted.forEach(d => {
      g.append('text')
        .attr('x', x(d.cantidad) + 7)
        .attr('y', y(d.tipo) + y.bandwidth() / 2)
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#4B5563')
        .attr('font-size', '11px')
        .text(`${d.pct}%  (${d.cantidad.toLocaleString('es-UY')})`)
    })
  }, [data])

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <svg ref={svgRef} style={{ display: 'block' }} />
      {tooltip && (
        <div style={{ ...TOOLTIP_STYLE, left: tooltip.x + 14, top: tooltip.y - 36 }}>
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
