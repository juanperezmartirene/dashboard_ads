import { useState } from 'react'
import { DEPTO_MAP } from '../data/processRealData'

const PARTIES_LIST   = ['Frente Amplio', 'Partido Nacional', 'Partido Colorado', 'Otros']
const ETAPAS_LIST    = ['Todas', 'Internas', 'Nacionales', 'Balotaje']
const TERR_LIST      = ['Nacional', 'Montevideo', 'Interior']
const DEPTOS_LIST    = ['Todos', ...Object.values(DEPTO_MAP).sort()]

export default function FilterPanel({
  selectedParties,      setSelectedParties,
  selectedEtapa,        setSelectedEtapa,
  selectedTerritorio,   setSelectedTerritorio,
  selectedDepartamento, setSelectedDepartamento,
  selectedPrecandidato, setSelectedPrecandidato,
  precandidatosList = [],
}) {
  const [open, setOpen] = useState(true)

  const toggleParty = (p) =>
    setSelectedParties(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])

  const toggleTerr = (t) =>
    setSelectedTerritorio(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const hasFilters = selectedParties.length > 0 || selectedEtapa !== 'Todas'
    || selectedTerritorio.length > 0 || selectedDepartamento !== 'Todos'
    || selectedPrecandidato !== 'Todos'

  const clearAll = () => {
    setSelectedParties([])
    setSelectedEtapa('Todas')
    setSelectedTerritorio([])
    setSelectedDepartamento('Todos')
    setSelectedPrecandidato('Todos')
  }

  const showPrecandidato = selectedEtapa === 'Internas'

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
        <div className="px-5 py-4 flex flex-wrap gap-x-8 gap-y-5">
          {/* Partido */}
          <div className="shrink-0">
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
          <div className="shrink-0">
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

            {/* Precandidato (solo cuando etapa = Internas) */}
            {showPrecandidato && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  Precandidato
                </p>
                <select
                  value={selectedPrecandidato}
                  onChange={e => setSelectedPrecandidato(e.target.value)}
                  className="w-48 text-xs border border-gray-200 rounded-sm px-2 py-1.5 text-gray-700 bg-white focus:outline-none focus:border-sky-400 transition-colors"
                >
                  <option value="Todos">Todos</option>
                  {precandidatosList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Territorio */}
          <div className="shrink-0">
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

          {/* Departamento */}
          <div className="shrink-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Departamento
            </p>
            <select
              value={selectedDepartamento}
              onChange={e => setSelectedDepartamento(e.target.value)}
              className="w-40 text-xs border border-gray-200 rounded-sm px-2 py-1.5 text-gray-700 bg-white focus:outline-none focus:border-sky-400 transition-colors"
            >
              {DEPTOS_LIST.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
