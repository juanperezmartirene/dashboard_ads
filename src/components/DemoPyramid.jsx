import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'

const AGE_ORDER = ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+']
const COLORS = { female: '#173363', male: '#0096D1', unknown: '#9CA3AF' }
const LABELS = { female: 'Mujeres', male: 'Hombres', unknown: 'Otros' }

export default function DemoPyramid({ data }) {
  if (!data || data.length === 0) return null

  // Build pyramid data: female as negative, male as positive
  const byAge = {}
  data.forEach(d => {
    if (!byAge[d.age]) byAge[d.age] = { age: d.age, female: 0, male: 0 }
    if (d.gender === 'female') byAge[d.age].female = d.pct
    else if (d.gender === 'male') byAge[d.age].male = d.pct
    else if (d.gender === 'unknown') {
      // Split unknown evenly
      byAge[d.age].female += d.pct / 2
      byAge[d.age].male += d.pct / 2
    }
  })

  const chartData = AGE_ORDER
    .filter(age => byAge[age])
    .map(age => ({
      age,
      female: -(byAge[age].female * 100),
      male: byAge[age].male * 100,
    }))

  if (chartData.length === 0) return null

  const maxVal = Math.max(
    ...chartData.map(d => Math.max(Math.abs(d.female), d.male))
  )
  const domainMax = Math.ceil(maxVal / 5) * 5 || 5

  const formatTick = (v) => `${Math.abs(v).toFixed(0)}%`

  const renderTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-white border border-gray-200 rounded px-3 py-2 shadow-sm text-xs">
        <p className="font-semibold text-gray-700 mb-1">{d.age} años</p>
        <p style={{ color: COLORS.female }}>Mujeres: {Math.abs(d.female).toFixed(1)}%</p>
        <p style={{ color: COLORS.male }}>Hombres: {d.male.toFixed(1)}%</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-center gap-4 mb-2">
        <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS.female }} />
          Mujeres
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS.male }} />
          Hombres
        </span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 10, bottom: 0, left: 10 }}
          barCategoryGap="18%"
        >
          <XAxis
            type="number"
            domain={[-domainMax, domainMax]}
            tickFormatter={formatTick}
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="age"
            tick={{ fontSize: 10, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip content={renderTooltip} cursor={false} />
          <ReferenceLine x={0} stroke="#E5E7EB" />
          <Bar dataKey="female" stackId="a" radius={[2, 0, 0, 2]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS.female} />
            ))}
          </Bar>
          <Bar dataKey="male" stackId="b" radius={[0, 2, 2, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS.male} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
