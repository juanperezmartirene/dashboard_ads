import { useState, useMemo } from 'react'

const COLS = [
  { key: 'tipo',        label: 'Tipo'          },
  { key: 'partido',     label: 'Partido'        },
  { key: 'etapa',       label: 'Etapa'          },
  { key: 'territorio',  label: 'Territorio'     },
  { key: 'gasto',       label: 'Gasto Est.'     },
  { key: 'impresiones', label: 'Impresiones'    },
  { key: 'combinacion', label: 'Combinación'    },
]

const PAGE_SIZE = 20

export default function DataTable({ data }) {
  const [sort,    setSort]    = useState({ key: null, dir: 'asc' })
  const [filters, setFilters] = useState({})
  const [page,    setPage]    = useState(0)

  const filtered = useMemo(() => {
    let rows = [...data]
    Object.entries(filters).forEach(([k, v]) => {
      if (v) rows = rows.filter(r => String(r[k]).toLowerCase().includes(v.toLowerCase()))
    })
    if (sort.key) {
      rows.sort((a, b) => {
        const av = a[sort.key], bv = b[sort.key]
        const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv), 'es')
        return sort.dir === 'asc' ? cmp : -cmp
      })
    }
    return rows
  }, [data, filters, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages - 1)
  const paged      = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  const handleSort = (key) => {
    setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })
    setPage(0)
  }

  const handleFilter = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }))
    setPage(0)
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {COLS.map(col => (
                <th key={col.key} className="border-b border-gray-200 bg-gray-50 text-left">
                  {/* Sort button */}
                  <button
                    onClick={() => handleSort(col.key)}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-800 flex items-center gap-1"
                  >
                    {col.label}
                    <span className="text-gray-300">
                      {sort.key === col.key ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </button>
                  {/* Filter input */}
                  <div className="px-3 pb-2">
                    <input
                      className="w-full text-xs border border-gray-200 rounded-sm px-2 py-1 outline-none focus:border-blue-400 placeholder-gray-300 bg-white"
                      placeholder="filtrar..."
                      value={filters[col.key] || ''}
                      onChange={e => handleFilter(col.key, e.target.value)}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={COLS.length} className="px-3 py-6 text-center text-sm text-gray-400">
                  Sin resultados
                </td>
              </tr>
            ) : paged.map(row => (
              <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {COLS.map(col => (
                  <td
                    key={col.key}
                    className={`px-3 py-2 text-gray-700 text-xs ${
                      col.key === 'impresiones' ? 'font-mono text-right tabular-nums' : ''
                    }`}
                  >
                    {col.key === 'impresiones'
                      ? row[col.key].toLocaleString('es-UY')
                      : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
        <span>
          {filtered.length.toLocaleString('es-UY')} registros
          {' · '}
          mostrando {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)}
        </span>
        <div className="flex items-center gap-1">
          <button
            className="px-2.5 py-1 border border-gray-200 rounded-sm hover:bg-gray-50 disabled:opacity-30"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={safePage === 0}
          >
            ← Anterior
          </button>

          {/* Page buttons (show max 7) */}
          {Array.from({ length: totalPages }, (_, i) => i)
            .filter(i => Math.abs(i - safePage) <= 3)
            .map(i => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`px-2.5 py-1 border rounded-sm ${
                  i === safePage
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}

          <button
            className="px-2.5 py-1 border border-gray-200 rounded-sm hover:bg-gray-50 disabled:opacity-30"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={safePage === totalPages - 1}
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  )
}
