import { useState, useMemo, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip as RechartTooltip,
  ResponsiveContainer, Cell, ReferenceLine, Legend,
} from 'recharts'
import { cn } from '../../lib/utils'

// ─── Gráfico por partido ──────────────────────────────────────────────────────

function PartyTooltip({ active, payload, metric }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg space-y-0.5">
      <p className="font-semibold mb-1">{d.partido}</p>
      <p>Anuncios: {d.anuncios.toLocaleString('es-UY')}</p>
      <p>Gasto est.: U$S {d.gasto.toLocaleString('es-UY')}</p>
      <p>Impresiones: {d.impresiones > 1e6 ? (d.impresiones / 1e6).toFixed(1) + ' M' : d.impresiones.toLocaleString('es-UY')}</p>
      <p>{d.cuentas} cuentas</p>
    </div>
  )
}

const PARTY_METRICS = [
  { key: 'anuncios',    label: 'Anuncios',     fmt: v => v.toLocaleString('es-UY') },
  { key: 'impresiones', label: 'Impresiones',  fmt: v => v > 1e6 ? `${(v/1e6).toFixed(1)} M` : v.toLocaleString('es-UY') },
  { key: 'gasto',       label: 'Gasto',        fmt: v => `U$S ${v.toLocaleString('es-UY')}` },
]

export function HomePartyChart({ stats, xDomain }) {
  const [metric, setMetric] = useState('anuncios')
  const metaDef = PARTY_METRICS.find(m => m.key === metric)
  const data = stats.byParty.filter(p => p.anuncios > 0)

  if (data.length === 0) {
    return <p className="text-xs text-gray-400 italic py-4">Sin anuncios con los filtros actuales.</p>
  }

  const chartHeight = Math.max(80, data.length * 48)
  const axisDomain = xDomain ? [0, xDomain[metric]] : undefined

  return (
    <div>
      <div className="flex gap-1 mb-3">
        {PARTY_METRICS.map(m => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className={cn(
              'text-xs px-2.5 py-1 rounded border transition-colors',
              metric === m.key
                ? 'border-sky-500 text-sky-700 bg-sky-50 font-medium'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 80, bottom: 4, left: 0 }}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            tickFormatter={v => metaDef.fmt(v)}
            axisLine={false}
            tickLine={false}
            domain={axisDomain}
          />
          <YAxis
            type="category"
            dataKey="short"
            tick={{ fontSize: 13, fill: '#374151', fontWeight: 500 }}
            width={120}
            axisLine={false}
            tickLine={false}
          />
          <RechartTooltip
            content={<PartyTooltip metric={metric} />}
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          />
          <Bar
            dataKey={metric}
            radius={[0, 3, 3, 0]}
            isAnimationActive
            animationDuration={450}
            animationEasing="ease-out"
            label={{
              position: 'right',
              formatter: v => metaDef.fmt(v),
              style: { fontSize: 11, fill: '#6B7280' },
            }}
          >
            {data.map(p => (
              <Cell key={p.partido} fill={p.color} fillOpacity={0.82} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Mapa coroplético por departamento ───────────────────────────────────────

function createMapProjection(features, width, height) {
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
  const padding = 12
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

function coordsToSvgPath(coords, project) {
  if (typeof coords[0][0] === 'number') {
    return coords.map((p, i) => {
      const [x, y] = project(p)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    }).join('') + 'Z'
  }
  return coords.map(ring => coordsToSvgPath(ring, project)).join('')
}

function featureToSvgPath(feature, project) {
  const { type, coordinates } = feature.geometry
  if (type === 'Polygon') return coordinates.map(ring => coordsToSvgPath(ring, project)).join('')
  if (type === 'MultiPolygon') return coordinates.map(p => p.map(ring => coordsToSvgPath(ring, project)).join('')).join('')
  return ''
}

const MAP_FILL_RANGE = ['#E0F2FE', '#7DD3FC', '#38BDF8', '#0EA5E9', '#0284C7', '#0369A1', '#075985']
const MAP_METRICS = [
  { key: 'impresiones', label: 'Impresiones' },
  { key: 'anuncios',    label: 'Anuncios'    },
  { key: 'gasto',       label: 'Gasto'       },
]

export function HomeDeptMap({ data, extMaxVal }) {
  const [geojson, setGeojson]   = useState(null)
  const [metric, setMetric]     = useState('impresiones')
  const [hovered, setHovered]   = useState(null)

  useEffect(() => {
    fetch('/data/departamentos.geojson').then(r => r.json()).then(setGeojson).catch(() => {})
  }, [])

  const lookup = useMemo(() => {
    if (!data) return {}
    const mv = extMaxVal?.[metric] ?? Math.max(...data.map(d => Number(d[metric]) || 0), 1)
    const map = {}
    data.forEach(d => {
      map[d.nombre] = {
        ratio:       (Number(d[metric]) || 0) / mv,
        anuncios:    d.anuncios    || 0,
        impresiones: d.impresiones || 0,
        gasto:       d.gasto       || 0,
      }
    })
    return map
  }, [data, metric, extMaxVal])

  const maxVal = useMemo(
    () => extMaxVal?.[metric] ?? Math.max(...(data || []).map(d => Number(d[metric]) || 0), 1),
    [data, metric, extMaxVal]
  )

  const getFill = (name) => {
    const entry = lookup[name]
    if (!entry || entry.ratio === 0) return '#F3F4F6'
    const idx = Math.min(MAP_FILL_RANGE.length - 1, Math.floor(entry.ratio * MAP_FILL_RANGE.length))
    return MAP_FILL_RANGE[idx]
  }

  const fmtHovered = (name) => {
    const entry = lookup[name]
    if (!entry) return 'sin datos'
    if (metric === 'impresiones') {
      const v = entry.impresiones
      return v > 1e6 ? `${(v / 1e6).toFixed(1)} M imp.` : `${v.toLocaleString('es-UY')} imp.`
    }
    if (metric === 'gasto') return `U$S ${entry.gasto.toLocaleString('es-UY')}`
    return `${entry.anuncios.toLocaleString('es-UY')} anuncios`
  }

  const fmtMax = () => {
    if (metric === 'impresiones') return maxVal > 1e6 ? `${(maxVal / 1e6).toFixed(0)} M` : maxVal.toLocaleString('es-UY')
    if (metric === 'gasto') return `U$S ${maxVal.toLocaleString('es-UY')}`
    return maxVal.toLocaleString('es-UY')
  }

  if (!data || data.length === 0) {
    return <p className="text-xs text-gray-400 italic py-4">Sin datos departamentales con los filtros actuales.</p>
  }

  const WIDTH = 320, HEIGHT = 340
  const project = geojson ? createMapProjection(geojson.features, WIDTH, HEIGHT) : null

  return (
    <div>
      <div className="flex gap-1 mb-3">
        {MAP_METRICS.map(m => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className={cn(
              'text-xs px-2.5 py-1 rounded border transition-colors',
              metric === m.key
                ? 'border-sky-500 text-sky-700 bg-sky-50 font-medium'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
      {!geojson ? (
        <div className="flex items-center justify-center h-48 text-xs text-gray-400">Cargando mapa…</div>
      ) : (
        <div className="flex flex-col items-center">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            width="100%"
            className="block max-w-xs mx-auto"
            role="img"
            aria-label="Mapa de distribución por departamento"
          >
            {geojson.features.map(f => {
              const name = f.properties.name
              return (
                <path
                  key={name}
                  d={featureToSvgPath(f, project)}
                  fill={getFill(name)}
                  stroke={hovered === name ? '#173363' : '#fff'}
                  strokeWidth={hovered === name ? 1.5 : 0.5}
                  onMouseEnter={() => setHovered(name)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'default', transition: 'fill 0.3s' }}
                />
              )
            })}
          </svg>
          <div className="h-6 mt-1 w-full text-center">
            {hovered && (
              <p className="text-xs text-gray-700">
                <span className="font-medium">{hovered}:</span>{' '}
                <span className="text-gray-500">{fmtHovered(hovered)}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-gray-400">0</span>
            {MAP_FILL_RANGE.map((c, i) => (
              <span key={i} className="inline-block w-3 h-2 rounded-sm" style={{ backgroundColor: c }} />
            ))}
            <span className="text-[9px] text-gray-400">{fmtMax()}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Line chart temporal ──────────────────────────────────────────────────────

const ELECTION_REFS = [
  { fecha: '2024-06-24', label: 'Internas'   },
  { fecha: '2024-10-21', label: 'Nacionales' },
  { fecha: '2024-11-18', label: 'Balotaje'   },
]

function fmtWeek(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  if (isNaN(d.getTime())) return dateStr
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return `${d.getDate()} ${meses[d.getMonth()]}`
}

const LINE_METRICS = [
  { key: 'anuncios',    label: 'Anuncios',    fmt: v => v.toLocaleString('es-UY') },
  { key: 'impresiones', label: 'Impresiones', fmt: v => v > 1e6 ? `${(v/1e6).toFixed(1)} M` : v.toLocaleString('es-UY') },
  { key: 'gasto',       label: 'Gasto',       fmt: v => `U$S ${v.toLocaleString('es-UY')}` },
]

const PARTY_LINES = [
  { key: 'total',            label: 'Total',             color: '#0096D1', width: 2.5 },
  { key: 'Partido Nacional', label: 'Partido Nacional',  color: '#0EA5E9', width: 1.5 },
  { key: 'Frente Amplio',    label: 'Frente Amplio',     color: '#EAB308', width: 1.5 },
  { key: 'Partido Colorado', label: 'Partido Colorado',  color: '#EF4444', width: 1.5 },
  { key: 'Otros',            label: 'Otros',             color: '#6B7280', width: 1.5 },
]

function LineTooltip({ active, payload, label, fmtVal }) {
  if (!active || !payload?.length) return null
  const byKey = Object.fromEntries(payload.map(p => [p.dataKey, p.value]))
  return (
    <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg space-y-0.5">
      <p className="font-semibold mb-1">Semana del {fmtWeek(label)}</p>
      {PARTY_LINES.map(pl => byKey[pl.key] != null && (
        <p key={pl.key} style={{ color: pl.color }}>
          {pl.label}: {fmtVal ? fmtVal(byKey[pl.key]) : byKey[pl.key].toLocaleString('es-UY')}
        </p>
      ))}
    </div>
  )
}

export function HomeLineChart({ data, metricKey, onMetricChange, yMax }) {
  const metaDef = LINE_METRICS.find(m => m.key === metricKey) || LINE_METRICS[0]
  if (!data || data.length === 0) {
    return <p className="text-xs text-gray-400 italic py-4">Sin datos temporales con los filtros actuales.</p>
  }
  const yDomain = yMax ? [0, yMax] : undefined
  return (
    <div>
      <div className="flex gap-1 mb-3">
        {LINE_METRICS.map(m => (
          <button
            key={m.key}
            onClick={() => onMetricChange(m.key)}
            className={cn(
              'text-xs px-2.5 py-1 rounded border transition-colors',
              metricKey === m.key
                ? 'border-sky-500 text-sky-700 bg-sky-50 font-medium'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 16, right: 16, bottom: 4, left: 8 }}>
          <XAxis
            dataKey="fecha"
            tickFormatter={fmtWeek}
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            tickFormatter={v => metaDef.fmt(v)}
            axisLine={false}
            tickLine={false}
            width={52}
            domain={yDomain}
          />
          <RechartTooltip
            content={<LineTooltip fmtVal={metaDef.fmt} />}
            cursor={{ stroke: '#E5E7EB' }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="plainline"
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            formatter={(value) => <span style={{ color: '#6B7280' }}>{value}</span>}
          />
          {ELECTION_REFS.map(el => (
            <ReferenceLine
              key={el.fecha}
              x={el.fecha}
              stroke="#D1D5DB"
              strokeDasharray="3 3"
              label={{ value: el.label, position: 'insideTopRight', fontSize: 9, fill: '#9CA3AF', dy: -4 }}
            />
          ))}
          {PARTY_LINES.map(pl => (
            <Line
              key={pl.key}
              type="monotone"
              dataKey={pl.key}
              name={pl.label}
              stroke={pl.color}
              strokeWidth={pl.width}
              dot={false}
              activeDot={{ r: 3, fill: pl.color }}
              isAnimationActive
              animationDuration={500}
              animationEasing="ease-out"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
