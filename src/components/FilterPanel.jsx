import { useState } from 'react'

const PARTIES_LIST   = ['Frente Amplio', 'Partido Nacional', 'Partido Colorado', 'Otros']
const ETAPAS_LIST    = ['Todas', 'Internas', 'Nacionales', 'Balotaje']
const TERR_LIST      = ['Nacional', 'Montevideo', 'Interior']

export default function FilterPanel({
  selectedParties, setSelectedParties,
  selectedEtapa,   setSelectedEtapa,
  selectedTerritorio, setSelectedTerritorio,
}) {
  const [open, setOpen] = useState(true)

  const toggleParty = (p) =>
    setSelectedParties(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])

  const toggleTerr = (t) =>
    setSelectedTerritorio(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const hasFilters = selectedParties.length > 0 || selectedEtapa !== 'Todas' || selectedTerritorio.length > 0

  const clearAll = () => {
    setSelectedParties([])
    setSelectedEtapa('Todas')
    setSelectedTerritorio([])
  }

  return (
    <div className="mb-5 border border-gray-200 rounded-sm bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
        >
          <span
            className="inline-block w-3 h-3 border border-gray-400"
            style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
          />
          Filtros
          {hasFilters && (
            <span className="ml-1 text-xs font-normal text-blue-500">activos</span>
          )}
        </button>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-gray-400 hover:text-gray-700 underline"
          >
            limpiar filtros
          </button>
        )}
      </div>

      {open && (
        <div className="px-5 py-4 grid grid-cols-3 gap-8">
          {/* Partido */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Partido
            </p>
            <div className="space-y-2">
              {PARTIES_LIST.map(p => (
                <label key={p} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-400"
                    checked={selectedParties.includes(p)}
                    onChange={() => toggleParty(p)}
                  />
                  {p}
                </label>
              ))}
            </div>
          </div>

          {/* Etapa */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Etapa Electoral
            </p>
            <div className="flex flex-wrap gap-2">
              {ETAPAS_LIST.map(e => (
                <button
                  key={e}
                  onClick={() => setSelectedEtapa(e)}
                  className={`px-3 py-1 text-xs rounded-sm border transition-colors ${
                    selectedEtapa === e
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'border-gray-300 text-gray-600 hover:border-gray-600 hover:text-gray-800'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Territorio */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Territorio
            </p>
            <div className="space-y-2">
              {TERR_LIST.map(t => (
                <label key={t} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-400"
                    checked={selectedTerritorio.includes(t)}
                    onChange={() => toggleTerr(t)}
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
