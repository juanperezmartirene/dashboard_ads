import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

const KEYS   = ['Promoción', 'CTA', 'Tema', 'Imagen', 'Ceremonial', 'Ataque']
const COLORS = {
  Promoción:   '#6366F1',
  CTA:         '#3B82F6',
  Tema:        '#10B981',
  Imagen:      '#F59E0B',
  Ceremonial:  '#8B5CF6',
  Ataque:      '#EF4444',
}

const TOOLTIP_STYLE = {
  position: 'fixed',
  background: '#1F2937',
  color: '#F9FAFB',
  padding: '7px 11px',
  borderRadius: '3px',
  fontSize: '11px',
  lineHeight: '1.6',
  pointerEvents: 'none',
  zIndex: 9999,
  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
}

export default function StackedAreaChart({ data, etapas }) {
  const svgRef       = useRef(null)
  const containerRef = useRef(null)
  const [hidden,  setHidden]  = useState(new Set())
  const [tooltip, setTooltip] = useState(null)

  const hiddenKey = [...hidden].sort().join(',')

  useEffect(() => {
    if (!data?.length || !svgRef.current || !containerRef.current) return

    const W = containerRef.current.clientWidth
    const margin = { top: 16, right: 16, bottom: 36, left: 58 }
    const w = W - margin.left - margin.right
    const H = 260

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('width', W).attr('height', H + margin.top + margin.bottom)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const activeKeys = KEYS.filter(k => !hidden.has(k))
    if (!activeKeys.length) return

    const parsed = data.map(d => ({ ...d, date: new Date(d.fecha) }))

    const stack = d3.stack().keys(activeKeys)
    const stacked = stack(parsed)

    const x = d3.scaleTime()
      .domain(d3.extent(parsed, d => d.date))
      .range([0, w])

    const yMax = d3.max(stacked, s => d3.max(s, d => d[1])) || 1
    const y = d3.scaleLinear().domain([0, yMax * 1.05]).range([H, 0])

    // Grid
    g.append('g')
      .selectAll('line')
      .data(y.ticks(5))
      .enter().append('line')
      .attr('x1', 0).attr('x2', w)
      .attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', '#F3F4F6').attr('stroke-width', 1)

    // Areas
    const area = d3.area()
      .x(d => x(d.data.date))
      .y0(d => y(d[0]))
      .y1(d => y(d[1]))
      .curve(d3.curveBasis)

    g.selectAll('.layer')
      .data(stacked)
      .enter().append('path')
      .attr('d', area)
      .attr('fill', d => COLORS[d.key])
      .attr('opacity', 0.72)

    // Election markers
    etapas.forEach(e => {
      const xPos = x(e.marker)
      g.append('line')
        .attr('x1', xPos).attr('x2', xPos)
        .attr('y1', 0).attr('y2', H)
        .attr('stroke', '#6B7280')
        .attr('stroke-dasharray', '4,3')
        .attr('stroke-width', 1.5)

      g.append('text')
        .attr('x', xPos + 4).attr('y', 11)
        .attr('fill', '#6B7280').attr('font-size', '9px')
        .text(e.nombre)
    })

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${H})`)
      .call(
        d3.axisBottom(x)
          .ticks(d3.timeMonth.every(2))
          .tickFormat(d3.timeFormat('%b %Y'))
      )
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('.tick line').remove())
      .call(ax => ax.selectAll('text').attr('fill', '#9CA3AF').attr('font-size', '10px'))

    // Y axis
    g.append('g')
      .call(
        d3.axisLeft(y).ticks(5).tickFormat(d => d.toLocaleString('es-UY'))
      )
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('.tick line').remove())
      .call(ax => ax.selectAll('text').attr('fill', '#9CA3AF').attr('font-size', '10px'))

    // Hover overlay
    const bisect = d3.bisector(d => d.date).left
    g.append('rect')
      .attr('width', w).attr('height', H)
      .attr('fill', 'transparent')
      .on('mousemove', (event) => {
        const [mx] = d3.pointer(event)
        const x0 = x.invert(mx)
        const idx = Math.min(bisect(parsed, x0), parsed.length - 1)
        const d = parsed[idx]
        const lines = activeKeys.map(k => `${k}: ${d[k]}`).join('  ·  ')
        setTooltip({ x: event.clientX, y: event.clientY, text: `${d.fecha}\n${lines}` })
      })
      .on('mouseleave', () => setTooltip(null))

  }, [data, etapas, hiddenKey])

  const toggle = (k) =>
    setHidden(prev => {
      const next = new Set(prev)
      next.has(k) ? next.delete(k) : next.add(k)
      return next
    })

  return (
    <div ref={containerRef}>
      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-3">
        {KEYS.map(k => (
          <button
            key={k}
            onClick={() => toggle(k)}
            className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-sm border transition-opacity ${hidden.has(k) ? 'opacity-35' : ''}`}
            style={{ borderColor: COLORS[k] }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[k] }} />
            {k}
          </button>
        ))}
      </div>
      <svg ref={svgRef} style={{ display: 'block' }} />
      {tooltip && (
        <div style={{ ...TOOLTIP_STYLE, left: tooltip.x + 14, top: tooltip.y - 50 }}>
          {tooltip.text.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
    </div>
  )
}
