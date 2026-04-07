import { useState, useEffect, useMemo } from 'react'

const FILL_DEFAULT = '#F3F4F6'
const FILL_RANGE = ['#E0F2FE', '#7DD3FC', '#38BDF8', '#0EA5E9', '#0284C7', '#0369A1', '#075985']
const STROKE = '#fff'
const STROKE_HIGHLIGHT = '#173363'

// Simple Mercator-like projection for Uruguay's bounding box
function createProjection(features, width, height) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  function scan(coords) {
    if (typeof coords[0] === 'number') {
      if (coords[0] < minX) minX = coords[0]
      if (coords[0] > maxX) maxX = coords[0]
      if (coords[1] < minY) minY = coords[1]
      if (coords[1] > maxY) maxY = coords[1]
      return
    }
    coords.forEach(scan)
  }
  features.forEach(f => scan(f.geometry.coordinates))

  const padding = 8
  const w = width - padding * 2
  const h = height - padding * 2
  const scaleX = w / (maxX - minX)
  const scaleY = h / (maxY - minY)
  const scale = Math.min(scaleX, scaleY)

  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2

  return ([lon, lat]) => [
    padding + (lon - cx) * scale + w / 2,
    padding + (cy - lat) * scale + h / 2,
  ]
}

function coordsToPath(coords, project) {
  if (typeof coords[0][0] === 'number') {
    return coords.map((p, i) => {
      const [x, y] = project(p)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    }).join('') + 'Z'
  }
  return coords.map(ring => coordsToPath(ring, project)).join('')
}

function featureToPath(feature, project) {
  const { type, coordinates } = feature.geometry
  if (type === 'Polygon') {
    return coordinates.map(ring => coordsToPath(ring, project)).join('')
  }
  if (type === 'MultiPolygon') {
    return coordinates.map(polygon =>
      polygon.map(ring => coordsToPath(ring, project)).join('')
    ).join('')
  }
  return ''
}

export default function RegionMap({ data }) {
  const [geojson, setGeojson] = useState(null)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    fetch('/data/departamentos.geojson')
      .then(r => r.json())
      .then(setGeojson)
      .catch(() => {})
  }, [])

  // Build lookup: region name → percentage
  const regionPcts = useMemo(() => {
    if (!data) return {}
    const map = {}
    data.forEach(d => { map[d.region] = d.pct })
    return map
  }, [data])

  const maxPct = useMemo(() => {
    const vals = Object.values(regionPcts)
    return vals.length > 0 ? Math.max(...vals) : 0
  }, [regionPcts])

  if (!geojson || !data || data.length === 0) return null

  const WIDTH = 200
  const HEIGHT = 220
  const project = createProjection(geojson.features, WIDTH, HEIGHT)

  function getFill(name) {
    const pct = regionPcts[name]
    if (pct == null || maxPct === 0) return FILL_DEFAULT
    const ratio = pct / maxPct
    const idx = Math.min(FILL_RANGE.length - 1, Math.floor(ratio * FILL_RANGE.length))
    return FILL_RANGE[idx]
  }

  const hoveredData = hovered ? regionPcts[hovered] : null

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width={WIDTH}
        height={HEIGHT}
        className="block"
        role="img"
        aria-label="Mapa de distribución de impresiones por departamento"
      >
        {geojson.features.map(f => {
          const name = f.properties.name
          const d = featureToPath(f, project)
          const isHovered = hovered === name
          return (
            <path
              key={name}
              d={d}
              fill={getFill(name)}
              stroke={isHovered ? STROKE_HIGHLIGHT : STROKE}
              strokeWidth={isHovered ? 1.5 : 0.5}
              onMouseEnter={() => setHovered(name)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'default', transition: 'fill 0.15s' }}
            />
          )
        })}
      </svg>
      {/* Tooltip */}
      <div className="h-5 mt-1">
        {hovered && (
          <p className="text-[10px] text-gray-600 text-center">
            {hovered}: {hoveredData != null ? `${(hoveredData * 100).toFixed(1)}%` : 'sin datos'}
          </p>
        )}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-1 mt-1">
        <span className="text-[9px] text-gray-400">0%</span>
        {FILL_RANGE.map((c, i) => (
          <span key={i} className="inline-block w-3 h-2 rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <span className="text-[9px] text-gray-400">{(maxPct * 100).toFixed(0)}%</span>
      </div>
    </div>
  )
}
