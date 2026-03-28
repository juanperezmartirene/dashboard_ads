export default function TopCuentas({ data }) {
  const cols = [
    {
      key: 'anuncios',
      label: 'Anuncios',
      subLabel: 'cantidad de anuncios',
      fmt: v => v.toLocaleString('es-UY'),
      color: '#173363',
    },
    {
      key: 'gasto',
      label: 'Gasto',
      subLabel: 'en U$S',
      fmt: v => `$${v.toLocaleString('es-UY')}`,
      color: '#0096D1',
    },
    {
      key: 'impresiones',
      label: 'Impresiones',
      subLabel: 'promedio estimado',
      fmt: v => `${(v / 1e6).toFixed(1)}M`,
      color: '#10B981',
    },
  ]

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {cols.map(col => (
          <div key={col.key}>
            {/* Encabezado columna */}
            <div
              className="px-3 py-2 mb-2 rounded-sm text-xs font-semibold uppercase tracking-wide text-white"
              style={{ backgroundColor: col.color }}
            >
              {col.label}
              <span className="block font-normal normal-case tracking-normal opacity-75 text-xs">
                {col.subLabel}
              </span>
            </div>

            {/* Filas */}
            <div className="space-y-1">
              {data.map((row, i) => {
                const item = row[col.key]
                if (!item) return null
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-sm border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <span
                      className="text-xs font-mono font-bold w-4 shrink-0"
                      style={{ color: col.color }}
                    >
                      {row.ranking}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">
                        {item.nombre}
                      </p>
                      <p className="text-xs font-mono text-gray-400">
                        {col.fmt(item.valor)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-4 italic">
        Fuente: Bogliaccini et al. (2025), Tabla 4. Elecciones nacionales (primera vuelta), jul.–oct. 2024.
      </p>
    </div>
  )
}
