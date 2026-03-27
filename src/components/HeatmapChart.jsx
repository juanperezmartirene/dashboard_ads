import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

const TYPE_KEYS = [
  { label: 'Promoción',  key: 'promocion'  },
  { label: 'CTA',        key: 'cta'        },
  { label: 'Tema',       key: 'tema'       },
  { label: 'Imagen',     key: 'imagen'     },
  { label: 'Ceremonial', key: 'ceremonial' },
  { label: 'Ataque',     key: 'ataque'     },
]

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

export default function HeatmapChart({ parties }) {
  const svgRef       = useRef(null)
  const containerRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    if (!parties?.length || !svgRef.current || !containerRef.current) return

    const MIN_W = 480
    const W = Math.max(containerRef.current.clientWidth, MIN_W)
    const margin = { top: 36, right: 12, bottom: 12, left: 128 }
    const cols = TYPE_KEYS.length
    const rows = parties.length
    const cellW = Math.floor((W - margin.left - margin.right) / cols)
    const cellH = 52
    const w = cellW * cols
    const h = cellH * rows

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('width', W).attr('height', h + margin.top + margin.bottom)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    // Flatten cells
    const cells = parties.flatMap((p, pi) =>
      TYPE_KEYS.map((t, ti) => ({
        partido: p.nombre, tipo: t.label,
        pct: p[t.key], pi, ti,
      }))
    )

    const maxPct = d3.max(cells, d => d.pct)
    const color = d3.scaleSequential()
      .domain([0, maxPct])
      .interpolator(d3.interpolateBlues)

    // Column headers
    TYPE_KEYS.forEach((t, i) => {
      g.append('text')
        .attr('x', i * cellW + cellW / 2).attr('y', -14)
        .attr('text-anchor', 'middle')
        .attr('fill', '#374151').attr('font-size', '11px').attr('font-weight', '600')
        .text(t.label)
    })

    // Row labels (shortened party names)
    parties.forEach((p, i) => {
      const shortName = p.nombre.replace('Partido ', 'P. ')
      g.append('text')
        .attr('x', -10).attr('y', i * cellH + cellH / 2)
        .attr('text-anchor', 'end').attr('dominant-baseline', 'middle')
        .attr('fill', '#374151').attr('font-size', '12px')
        .text(shortName)
    })

    // Cells
    cells.forEach(cell => {
      const cx = cell.ti * cellW
      const cy = cell.pi * cellH
      const PAD = 2

      g.append('rect')
        .attr('x', cx + PAD).attr('y', cy + PAD)
        .attr('width', cellW - PAD * 2).attr('height', cellH - PAD * 2)
        .attr('fill', color(cell.pct)).attr('rx', 3)
        .on('mousemove', (event) => {
          setTooltip({
            x: event.clientX, y: event.clientY,
            text: `${cell.partido} · ${cell.tipo}: ${cell.pct}%`,
          })
        })
        .on('mouseleave', () => setTooltip(null))

      // Text label (only when >= 5%)
      if (cell.pct >= 5) {
        const textColor = cell.pct >= 28 ? '#FFFFFF' : '#1F2937'
        g.append('text')
          .attr('x', cx + cellW / 2).attr('y', cy + cellH / 2)
          .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
          .attr('fill', textColor).attr('font-size', '13px').attr('font-weight', '600')
          .attr('pointer-events', 'none')
          .text(`${cell.pct}%`)
      }
    })

    // Color scale legend (bottom strip)
    const legendW = w
    const legendH = 8
    const legendG = g.append('g').attr('transform', `translate(0,${h + 8})`)
    const defs = svg.append('defs')
    const grad = defs.append('linearGradient').attr('id', 'heatmap-grad')
    ;[0, 0.25, 0.5, 0.75, 1].forEach(t => {
      grad.append('stop')
        .attr('offset', `${t * 100}%`)
        .attr('stop-color', color(t * maxPct))
    })
    legendG.append('rect')
      .attr('width', legendW).attr('height', legendH).attr('rx', 2)
      .attr('fill', 'url(#heatmap-grad)')
    legendG.append('text')
      .attr('x', 0).attr('y', legendH + 12)
      .attr('fill', '#9CA3AF').attr('font-size', '9px').text('0%')
    legendG.append('text')
      .attr('x', legendW).attr('y', legendH + 12)
      .attr('text-anchor', 'end').attr('fill', '#9CA3AF').attr('font-size', '9px')
      .text(`${maxPct}%`)

  }, [parties])

  return (
    <div ref={containerRef} className="overflow-x-auto">
      <svg ref={svgRef} style={{ display: 'block' }} />
      {tooltip && (
        <div style={{ ...TOOLTIP_STYLE, left: tooltip.x + 14, top: tooltip.y - 36 }}>
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
