import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'

const METRICS = [
  {
    key: 'impresiones',
    label: 'Impresiones',
    fmt: v => v > 1e6 ? (v / 1e6).toFixed(1) + ' M' : v.toLocaleString('es-UY'),
  },
  {
    key: 'anuncios',
    label: 'Anuncios',
    fmt: v => v.toLocaleString('es-UY'),
  },
  {
    key: 'gasto',
    label: 'Gasto (U$S)',
    fmt: v => v.toLocaleString('es-UY'),
  },
]

const BAR_COLOR = '#0096D1'

function CustomTooltip({ active, payload, metric }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg">
      <p className="font-semibold mb-0.5">{d.nombre}</p>
      <p>{metric.label}: {metric.fmt(d[metric.key])}</p>
    </div>
  )
}

export default function DepartmentChart({ data }) {
  const [metricIdx, setMetricIdx] = useState(0)
  const metric = METRICS[metricIdx]

  const sorted = [...(data || [])]
    .sort((a, b) => b[metric.key] - a[metric.key])
    .slice(0, 15)

  const barHeight = 22
  const chartHeight = Math.max(120, sorted.length * barHeight + 20)

  return (
    <div>
      {/* Selector de métrica */}
      <div className="flex gap-1.5 mb-4">
        {METRICS.map((m, i) => (
          <button
            key={m.key}
            onClick={() => setMetricIdx(i)}
            className="px-2.5 py-1 text-xs rounded-sm border transition-colors"
            style={
              metricIdx === i
                ? { backgroundColor: '#173363', color: '#fff', borderColor: '#173363' }
                : { borderColor: '#D1D5DB', color: '#6B7280' }
            }
          >
            {m.label}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <p className="text-xs text-gray-400 italic py-4">
          Sin datos departamentales con los filtros actuales.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={sorted}
            layout="vertical"
            margin={{ top: 2, right: 60, bottom: 2, left: 0 }}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              tickFormatter={v =>
                v >= 1e6
                  ? (v / 1e6).toFixed(1) + 'M'
                  : v >= 1e3
                  ? (v / 1e3).toFixed(0) + 'k'
                  : String(v)
              }
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="nombre"
              tick={{ fontSize: 11, fill: '#374151' }}
              width={96}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip metric={metric} />}
              cursor={{ fill: 'rgba(0,150,209,0.06)' }}
            />
            <Bar
              dataKey={metric.key}
              radius={[0, 3, 3, 0]}
              isAnimationActive
              animationDuration={500}
              animationEasing="ease-out"
              label={{
                position: 'right',
                formatter: v => metric.fmt(v),
                style: { fontSize: 10, fill: '#6B7280' },
              }}
            >
              {sorted.map(d => (
                <Cell
                  key={d.nombre}
                  fill={BAR_COLOR}
                  fillOpacity={0.75}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
