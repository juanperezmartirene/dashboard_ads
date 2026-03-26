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

// ── Gráfico 1: Comparativo global (Meta vs TV vs Publicidad vs Total) ─────────
export function GastoComparativoGlobal({ data }) {
  const svgRef       = useRef(null)
  const containerRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    if (!data?.length || !svgRef.current || !containerRef.current) return

    const W = containerRef.current.clientWidth
    const margin = { top: 6, right: 130, bottom: 28, left: 200 }
    const w = W - margin.left - margin.right
    const ROW_H = 48
    const h = data.length * ROW_H

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('width', W).attr('height', h + margin.top + margin.bottom)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.valor) * 1.2])
      .range([0, w])

    const y = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, h])
      .padding(0.35)

    // Grid
    g.append('g').selectAll('line')
      .data(x.ticks(5)).enter().append('line')
      .attr('x1', d => x(d)).attr('x2', d => x(d))
      .attr('y1', 0).attr('y2', h)
      .attr('stroke', '#F3F4F6').attr('stroke-width', 1)

    // X axis
    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => `$${(d / 1e6).toFixed(1)}M`))
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('.tick line').remove())
      .call(ax => ax.selectAll('text').attr('fill', '#9CA3AF').attr('font-size', '10px'))

    // Y axis labels
    data.forEach(d => {
      g.append('text')
        .attr('x', -10).attr('y', y(d.label) + y.bandwidth() / 2)
        .attr('text-anchor', 'end').attr('dominant-baseline', 'middle')
        .attr('fill', '#374151').attr('font-size', '12px').attr('font-weight', '500')
        .text(d.label)
    })

    // Bars — coloreadas por posición (de más a menos)
    const barColors = ['#1F2937', '#374151', '#6B7280', '#0096D1']

    data.forEach((d, i) => {
      g.append('rect')
        .attr('x', 0)
        .attr('y', y(d.label))
        .attr('width', x(d.valor))
        .attr('height', y.bandwidth())
        .attr('fill', barColors[i] || '#9CA3AF')
        .attr('rx', 2)
        .on('mousemove', (event) => {
          setTooltip({
            x: event.clientX, y: event.clientY,
            text: `${d.label}: U$S ${d.valor.toLocaleString('es-UY')}`,
          })
        })
        .on('mouseleave', () => setTooltip(null))

      g.append('text')
        .attr('x', x(d.valor) + 7)
        .attr('y', y(d.label) + y.bandwidth() / 2)
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#4B5563').attr('font-size', '11px').attr('font-mono', true)
        .text(`U$S ${d.valor.toLocaleString('es-UY')}`)
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

// ── Gráfico 2: Meta vs TV por partido ─────────────────────────────────────────
export function GastoMetaVsTV({ data }) {
  const svgRef       = useRef(null)
  const containerRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    if (!data?.length || !svgRef.current || !containerRef.current) return

    const W = containerRef.current.clientWidth
    const margin = { top: 20, right: 160, bottom: 28, left: 80 }
    const w = W - margin.left - margin.right
    const ROW_H = 56
    const h = data.length * ROW_H

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('width', W).attr('height', h + margin.top + margin.bottom)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const maxVal = d3.max(data, d => Math.max(d.meta_total, d.television))
    const x = d3.scaleLinear().domain([0, maxVal * 1.25]).range([0, w])

    const yOuter = d3.scaleBand().domain(data.map(d => d.short)).range([0, h]).padding(0.28)
    const yInner = d3.scaleBand().domain(['Meta', 'TV']).range([0, yOuter.bandwidth()]).padding(0.08)

    // Leyenda superior
    const legendItems = [
      { label: 'Gasto en Meta (total)',   color: '#0096D1' },
      { label: 'Gasto en TV',            color: '#9CA3AF' },
    ]
    legendItems.forEach((item, i) => {
      g.append('rect').attr('x', i * 180).attr('y', -16).attr('width', 10).attr('height', 10).attr('fill', item.color).attr('rx', 2)
      g.append('text').attr('x', i * 180 + 14).attr('y', -7).attr('fill', '#6B7280').attr('font-size', '10px').text(item.label)
    })

    // Grid
    g.append('g').selectAll('line')
      .data(x.ticks(4)).enter().append('line')
      .attr('x1', d => x(d)).attr('x2', d => x(d))
      .attr('y1', 0).attr('y2', h)
      .attr('stroke', '#F3F4F6').attr('stroke-width', 1)

    // X axis
    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(4).tickFormat(d => `$${(d / 1000).toFixed(0)}k`))
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('.tick line').remove())
      .call(ax => ax.selectAll('text').attr('fill', '#9CA3AF').attr('font-size', '10px'))

    // Y labels (partido short)
    data.forEach(d => {
      g.append('text')
        .attr('x', -8).attr('y', yOuter(d.short) + yOuter.bandwidth() / 2)
        .attr('text-anchor', 'end').attr('dominant-baseline', 'middle')
        .attr('fill', d.color).attr('font-size', '13px').attr('font-weight', '700')
        .text(d.short)
    })

    // Grouped bars: Meta + TV
    data.forEach(d => {
      const outerY = yOuter(d.short)

      const bars = [
        { key: 'Meta', val: d.meta_total, color: '#0096D1' },
        { key: 'TV',   val: d.television, color: '#D1D5DB' },
      ]

      bars.forEach(b => {
        const by = outerY + yInner(b.key)
        g.append('rect')
          .attr('x', 0).attr('y', by)
          .attr('width', x(b.val)).attr('height', yInner.bandwidth())
          .attr('fill', b.color).attr('rx', 2)
          .on('mousemove', (event) => {
            setTooltip({
              x: event.clientX, y: event.clientY,
              text: `${d.partido} · ${b.key}: U$S ${b.val.toLocaleString('es-UY')}`,
            })
          })
          .on('mouseleave', () => setTooltip(null))

        g.append('text')
          .attr('x', x(b.val) + 5).attr('y', by + yInner.bandwidth() / 2)
          .attr('dominant-baseline', 'middle')
          .attr('fill', '#6B7280').attr('font-size', '10px')
          .text(`U$S ${b.val.toLocaleString('es-UY')}`)
      })

      // % label
      const pct = Math.round((d.meta_total / d.television) * 100)
      g.append('text')
        .attr('x', w + 10).attr('y', outerY + yOuter.bandwidth() / 2)
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#0096D1').attr('font-size', '11px').attr('font-weight', '600')
        .text(`${pct}% de TV`)
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
