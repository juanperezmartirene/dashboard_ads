import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'

const AGE_ORDER = ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+']
const COLORS = { female: '#173363', male: '#0096D1' }

export default function DemoPyramid({ data }) {
  if (!data || data.length === 0) return null

  const byAge = {}
  data.forEach(d => {
    if (!byAge[d.age]) byAge[d.age] = { age: d.age, female: 0, male: 0 }
    if (d.gender === 'female') byAge[d.age].female = d.pct
    else if (d.gender === 'male') byAge[d.age].male = d.pct
    else if (d.gender === 'unknown') {
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
      femalePct: (byAge[age].female * 100).toFixed(1),
      malePct: (byAge[age].male * 100).toFixed(1),
    }))

  if (chartData.length === 0) return null

  const maxVal = Math.max(...chartData.map(d => Math.max(Math.abs(d.female), d.male)))
  const domainMax = Math.ceil(maxVal / 5) * 5 || 5

  const formatTick = (v) => `${Math.abs(v).toFixed(0)}%`

  const renderTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-white border border-gray-200 rounded px-3 py-2 shadow-sm text-xs">
        <p className="font-semibold text-gray-700 mb-1">{d.age} años</p>
        <p style={{ color: COLORS.female }}>Mujeres: {d.femalePct}%</p>
        <p style={{ color: COLORS.male }}>Hombres: {d.malePct}%</p>
      </div>
    )
  }

  // Labels outside the bars
  const BarLabel = (props) => {
    const { x, y, width, height, value } = props
    if (!value || Math.abs(value) < 0.3) return null
    const pct = Math.abs(value).toFixed(1)
    const isNeg = value < 0
    const xPos = isNeg ? x - 4 : x + width + 4
    const anchor = isNeg ? 'end' : 'start'
    return (
      <text
        x={xPos}
        y={y + height / 2}
        dy={4}
        textAnchor={anchor}
        fontSize={10}
        fill="#9CA3AF"
      >
        {pct}%
      </text>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-center gap-4 mb-2">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS.female }} />
          Mujeres
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS.male }} />
          Hombres
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 44, bottom: 0, left: 10 }}
          barCategoryGap="20%"
          barGap={0}
        >
          <XAxis
            type="number"
            domain={[-domainMax, domainMax]}
            tickFormatter={formatTick}
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="age"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            width={38}
          />
          <Tooltip content={renderTooltip} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <ReferenceLine x={0} stroke="#E5E7EB" />
          <Bar dataKey="female" fill={COLORS.female} radius={[2, 0, 0, 2]} label={<BarLabel />}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS.female} />
            ))}
          </Bar>
          <Bar dataKey="male" fill={COLORS.male} radius={[0, 2, 2, 0]} label={<BarLabel />}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS.male} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
