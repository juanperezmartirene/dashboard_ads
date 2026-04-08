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
      femalePct: (byAge[age].female * 100),
      malePct: (byAge[age].male * 100),
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

      {/* Filas de barras */}
      <div className="space-y-1">
        {chartData.map(row => {
          const femaleW = (row.femalePct / maxPct) * 100
          const maleW   = (row.malePct  / maxPct) * 100
          return (
            <div key={row.age} className="flex items-center" style={{ height: 24 }}>
              {/* Etiqueta de edad */}
              <span
                className="shrink-0 text-right text-xs text-gray-500 pr-2"
                style={{ width: 38 }}
              >
                {row.age}
              </span>

              {/* Lado mujeres: barra crece hacia la derecha (centrada a la derecha) */}
              <div className="flex-1 flex items-center justify-end">
                {row.femalePct > 0 && (
                  <span className="text-[10px] text-gray-400 mr-1.5 shrink-0">
                    {row.femalePct.toFixed(1)}%
                  </span>
                )}
                <div
                  className="h-4 rounded-l-sm shrink-0"
                  style={{ width: `${femaleW}%`, backgroundColor: COLORS.female }}
                />
              </div>

              {/* Línea central */}
              <div className="shrink-0 self-stretch w-px" style={{ backgroundColor: '#E5E7EB' }} />

              {/* Lado hombres: barra crece hacia la derecha */}
              <div className="flex-1 flex items-center justify-start">
                <div
                  className="h-4 rounded-r-sm shrink-0"
                  style={{ width: `${maleW}%`, backgroundColor: COLORS.male }}
                />
                {row.malePct > 0 && (
                  <span className="text-[10px] text-gray-400 ml-1.5 shrink-0">
                    {row.malePct.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Eje X */}
      <div className="flex mt-1 text-[10px] text-gray-300" style={{ paddingLeft: 38 }}>
        <div className="flex-1 flex justify-start">
          <span>{maxPct.toFixed(0)}%</span>
        </div>
        <div className="flex-1 flex justify-end">
          <span>{maxPct.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  )
}
