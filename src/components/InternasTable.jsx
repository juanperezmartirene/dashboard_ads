import { useState, useMemo } from 'react'

const METRICS = [
  { key: 'anuncios',    label: 'Anuncios',          fmt: v => v.toLocaleString('es-UY') },
  { key: 'impresiones', label: 'Impresiones',        fmt: v => v.toLocaleString('es-UY') },
  { key: 'gasto',       label: 'Gasto (U$S)',        fmt: v => `$${v.toLocaleString('es-UY')}` },
  { key: 'imp_dolar',   label: 'Imp. por dólar',     fmt: v => v.toLocaleString('es-UY') },
]

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5" style={{ minWidth: 60 }}>
        <div
          className="h-1.5 rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export default function InternasTable({ data }) {
  const [sortMetric, setSortMetric] = useState('gasto')
  const [sortDir,    setSortDir]    = useState('desc')

  // Aplanar todos los candidatos con info de partido
  const rows = useMemo(() => {
    const all = []
    data.forEach(partido => {
      partido.candidatos.forEach(c => {
        all.push({ ...c, partido: partido.short, color: partido.color, isTotal: false })
      })
      all.push({ ...partido.total, nombre: `Total ${partido.short}`, partido: partido.short, color: partido.color, isTotal: true })
    })
    return all
  }, [data])

  const maxByMetric = useMemo(() => {
    const candidatos = rows.filter(r => !r.isTotal)
    return {
      anuncios:    Math.max(...candidatos.map(r => r.anuncios)),
      impresiones: Math.max(...candidatos.map(r => r.impresiones)),
      gasto:       Math.max(...candidatos.map(r => r.gasto)),
      imp_dolar:   Math.max(...candidatos.map(r => r.imp_dolar)),
    }
  }, [rows])

  const handleSort = (key) => {
    if (sortMetric === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortMetric(key); setSortDir('desc') }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-200 whitespace-nowrap">
              Candidato/a
            </th>
            <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-200">
              Partido
            </th>
            {METRICS.map(m => (
              <th
                key={m.key}
                className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-200 whitespace-nowrap cursor-pointer hover:text-gray-700 select-none"
                onClick={() => handleSort(m.key)}
              >
                {m.label}
                {' '}
                <span className="text-gray-300">
                  {sortMetric === m.key ? (sortDir === 'desc' ? '↓' : '↑') : '↕'}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((partido) => {
            // Candidatos de este partido, ordenados
            const candidatos = [...partido.candidatos].sort((a, b) => {
              const cmp = b[sortMetric] - a[sortMetric]
              return sortDir === 'desc' ? cmp : -cmp
            })

            return [
              ...candidatos.map((c, ci) => (
                <tr
                  key={`${partido.short}-${ci}`}
                  className="hover:bg-gray-50/60 transition-colors"
                >
                  <td className="px-4 py-2.5 text-sm text-gray-700 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: partido.color }}
                      />
                      {c.nombre}
                    </div>
                    <MiniBar value={c[sortMetric]} max={maxByMetric[sortMetric]} color={partido.color} />
                  </td>
                  <td className="px-3 py-2.5 border-b border-gray-100">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded"
                      style={{ backgroundColor: partido.color + '18', color: partido.color }}
                    >
                      {partido.short}
                    </span>
                  </td>
                  {METRICS.map(m => (
                    <td
                      key={m.key}
                      className={`px-4 py-2.5 text-right font-mono text-sm border-b border-gray-100 ${sortMetric === m.key ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}
                    >
                      {m.fmt(c[m.key])}
                    </td>
                  ))}
                </tr>
              )),
              // Fila de total del partido
              <tr
                key={`total-${partido.short}`}
                style={{ backgroundColor: partido.color + '0A' }}
              >
                <td className="px-4 py-2 text-xs font-semibold border-b-2 border-gray-200" style={{ color: partido.color }}>
                  Total {partido.partido}
                </td>
                <td className="px-3 py-2 border-b-2 border-gray-200" />
                {METRICS.map(m => (
                  <td
                    key={m.key}
                    className="px-4 py-2 text-right font-mono text-xs font-semibold border-b-2 border-gray-200"
                    style={{ color: partido.color }}
                  >
                    {m.fmt(partido.total[m.key])}
                  </td>
                ))}
              </tr>,
            ]
          })}
        </tbody>
      </table>

      <p className="text-xs text-gray-400 mt-3 italic">
        Fuente: Bogliaccini, Fynn, Piñeiro-Rodríguez & Rosenblatt (2025), Tabla 2. Las impresiones son promedios de rangos reportados por Meta.
      </p>
    </div>
  )
}
