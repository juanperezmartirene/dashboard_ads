const AGE_ORDER = ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+']
const COLORS = { female: '#173363', male: '#0096D1' }

const LABEL_W = 40 // px reservados para cada label de porcentaje

export default function DemoPyramid({ data, metric = 'impresiones' }) {
  if (!data || data.length === 0) return null

  const byAge = {}
  data.forEach(d => {
    if (!byAge[d.age]) byAge[d.age] = { age: d.age, female: 0, male: 0 }
    const val = metric === 'gasto' ? (d.gastoFrac ?? d.pct) : d.pct
    if (d.gender === 'female') byAge[d.age].female = val
    else if (d.gender === 'male') byAge[d.age].male = val
    else if (d.gender === 'unknown') {
      byAge[d.age].female += val / 2
      byAge[d.age].male += val / 2
    }
  })

  const chartData = AGE_ORDER
    .filter(age => byAge[age])
    .map(age => ({
      age,
      femalePct: byAge[age].female * 100,
      malePct:   byAge[age].male   * 100,
    }))

  if (chartData.length === 0) return null

  const maxPct = Math.max(...chartData.map(d => Math.max(d.femalePct, d.malePct)), 1)

  return (
    <div>
      {/* Leyenda */}
      <div className="flex items-center justify-center gap-4 mb-3">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS.female }} />
          Mujeres
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS.male }} />
          Hombres
        </span>
      </div>

      {/* Filas */}
      <div className="space-y-1">
        {chartData.map(row => {
          const femaleW = (row.femalePct / maxPct) * 100
          const maleW   = (row.malePct   / maxPct) * 100
          return (
            <div key={row.age} className="flex items-center" style={{ height: 24 }}>

              {/* Etiqueta edad */}
              <span
                className="shrink-0 text-right text-xs text-gray-500 pr-2 whitespace-nowrap"
                style={{ width: 42 }}
              >
                {row.age}
              </span>

              {/* Lado mujeres */}
              <div className="flex-1 flex items-center justify-end overflow-hidden">
                <span
                  className="shrink-0 text-right text-[10px] text-gray-400 pr-1"
                  style={{ width: LABEL_W }}
                >
                  {row.femalePct > 0 ? `${row.femalePct.toFixed(1)}%` : ''}
                </span>
                <div
                  className="h-4 rounded-l-sm shrink-0 transition-all duration-500"
                  style={{
                    width: `calc(${femaleW}% - ${LABEL_W}px)`,
                    maxWidth: `calc(100% - ${LABEL_W}px)`,
                    backgroundColor: COLORS.female,
                    minWidth: row.femalePct > 0 ? 2 : 0,
                  }}
                />
              </div>

              {/* Línea central */}
              <div className="shrink-0 self-stretch w-px" style={{ backgroundColor: '#E5E7EB' }} />

              {/* Lado hombres */}
              <div className="flex-1 flex items-center overflow-hidden">
                <div
                  className="h-4 rounded-r-sm shrink-0 transition-all duration-500"
                  style={{
                    width: `calc(${maleW}% - ${LABEL_W}px)`,
                    maxWidth: `calc(100% - ${LABEL_W}px)`,
                    backgroundColor: COLORS.male,
                    minWidth: row.malePct > 0 ? 2 : 0,
                  }}
                />
                <span
                  className="shrink-0 text-left text-[10px] text-gray-400 pl-1"
                  style={{ width: LABEL_W }}
                >
                  {row.malePct > 0 ? `${row.malePct.toFixed(1)}%` : ''}
                </span>
              </div>

            </div>
          )
        })}
      </div>

      {/* Eje X */}
      <div className="flex mt-1 text-[10px] text-gray-300" style={{ paddingLeft: 42 }}>
        <div className="flex-1 flex justify-start pl-10">
          <span>{maxPct.toFixed(0)}%</span>
        </div>
        <div className="flex-1 flex justify-end pr-10">
          <span>{maxPct.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  )
}
