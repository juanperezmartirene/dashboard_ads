import { useMemo, useState } from 'react'
import { useFilteredData } from '../hooks/useFilteredData'
import FilterPanel from './FilterPanel'
import { computeTiposTotales, TIPOS_META } from '../data/processRealData'

const PANEL_COLORS = { A: '#0096D1', B: '#173363' }

const METRICS = [
  { key: 'anuncios',    label: 'Anuncios',    fmt: v => v.toLocaleString('es-UY') },
  { key: 'gasto',       label: 'Gasto est.',  fmt: v => `U$S ${v.toLocaleString('es-UY')}` },
  { key: 'imp',         label: 'Impresiones', fmt: v => v >= 1e6 ? `${(v/1e6).toFixed(1)} M` : v.toLocaleString('es-UY') },
]

function filterSummary(fd) {
  const parts = []
  if (fd.selectedParties.length) parts.push(fd.selectedParties.join(', '))
  if (fd.selectedEtapa !== 'Todas') parts.push(fd.selectedEtapa)
  if (fd.selectedTerritorio.length) parts.push(fd.selectedTerritorio.join(', '))
  return parts.length ? parts.join(' · ') : 'Todos los anuncios'
}

export default function PageComparacion({ tableData, adDetails }) {
  const fdA = useFilteredData(tableData, adDetails)
  const fdB = useFilteredData(tableData, adDetails)

  const tiposA = useMemo(() => computeTiposTotales(fdA.filteredTable), [fdA.filteredTable])
  const tiposB = useMemo(() => computeTiposTotales(fdB.filteredTable), [fdB.filteredTable])

  const statsA = fdA.filteredStats
  const statsB = fdB.filteredStats

  const COMP_ROWS = [
    { label: 'Anuncios',    valA: statsA.totalAnuncios, valB: statsB.totalAnuncios, fmt: v => v.toLocaleString('es-UY') },
    { label: 'Gasto est.',  valA: statsA.totalGasto,    valB: statsB.totalGasto,    fmt: v => `U$S ${v.toLocaleString('es-UY')}` },
    { label: 'Impresiones', valA: statsA.totalImp,      valB: statsB.totalImp,      fmt: v => v >= 1e6 ? `${(v/1e6).toFixed(1)} M` : v.toLocaleString('es-UY') },
    { label: 'Cuentas',     valA: statsA.cuentas,       valB: statsB.cuentas,       fmt: v => v.toLocaleString('es-UY') },
  ]

  return (
    <div className="border-t border-gray-100" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="max-w-[1152px] mx-auto px-4 md:px-8 py-10 md:py-14">

        {/* Leyenda A/B */}
        <div className="flex items-center gap-6 mb-8">
          {(['A', 'B']).map(p => {
            const fd = p === 'A' ? fdA : fdB
            return (
              <div key={p} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: PANEL_COLORS[p] }} />
                <span className="text-sm font-semibold text-gray-700">Conjunto {p}</span>
                <span className="text-xs text-gray-400">{filterSummary(fd)}</span>
              </div>
            )
          })}
        </div>

        {/* Paneles de filtros lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {[{ p: 'A', fd: fdA }, { p: 'B', fd: fdB }].map(({ p, fd }) => (
            <div key={p}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: PANEL_COLORS[p] }} />
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                  Conjunto {p}
                </span>
              </div>
              <FilterPanel
                selectedParties={fd.selectedParties}
                setSelectedParties={fd.setSelectedParties}
                selectedEtapa={fd.selectedEtapa}
                setSelectedEtapa={fd.setSelectedEtapa}
                selectedTerritorio={fd.selectedTerritorio}
                setSelectedTerritorio={fd.setSelectedTerritorio}
                selectedDepartamento={fd.selectedDepartamento}
                setSelectedDepartamento={fd.setSelectedDepartamento}
                selectedPrecandidato={fd.selectedPrecandidato}
                setSelectedPrecandidato={fd.setSelectedPrecandidato}
                precandidatosList={fd.precandidatosList}
                defaultOpen
              />
            </div>
          ))}
        </div>

        {/* Tabla comparativa de métricas */}
        <div className="bg-white border border-gray-200 rounded-sm p-5 mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-4">Comparación de métricas</p>
          {COMP_ROWS.map(row => {
            const maxV = Math.max(row.valA, row.valB, 1)
            return (
              <div key={row.label} className="mb-4 last:mb-0">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  {row.label}
                </span>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs font-mono w-24 text-right shrink-0" style={{ color: PANEL_COLORS.A }}>
                    {row.fmt(row.valA)}
                  </span>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="h-2.5 bg-gray-100 rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm transition-all duration-500"
                        style={{ width: `${(row.valA / maxV) * 100}%`, background: PANEL_COLORS.A, opacity: 0.8 }}
                      />
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm transition-all duration-500"
                        style={{ width: `${(row.valB / maxV) * 100}%`, background: PANEL_COLORS.B, opacity: 0.8 }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-mono w-24 shrink-0" style={{ color: PANEL_COLORS.B }}>
                    {row.fmt(row.valB)}
                  </span>
                </div>
              </div>
            )
          })}
          <div className="flex gap-5 mt-4 pt-3 border-t border-gray-100">
            {(['A', 'B']).map(p => (
              <div key={p} className="flex items-center gap-1.5">
                <div className="w-3 h-2 rounded-sm opacity-80" style={{ background: PANEL_COLORS[p] }} />
                <span className="text-[10px] text-gray-500">Conjunto {p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Distribución de tipos de anuncio */}
        <div className="bg-white border border-gray-200 rounded-sm p-5">
          <p className="text-sm font-semibold text-gray-700 mb-1">Distribución de tipos de anuncio</p>
          <p className="text-xs text-gray-400 mb-4">
            Porcentaje relativo dentro de cada conjunto · Multi-etiqueta (los % no suman 100%)
          </p>
          {TIPOS_META.map(t => {
            const tA = tiposA.find(x => x.key === t.key)
            const tB = tiposB.find(x => x.key === t.key)
            const totalA = Math.max(fdA.filteredTable.filter(r => r._clasi).length, 1)
            const totalB = Math.max(fdB.filteredTable.filter(r => r._clasi).length, 1)
            const pctA = tA ? Math.round((tA.count / totalA) * 100) : 0
            const pctB = tB ? Math.round((tB.count / totalB) * 100) : 0
            const maxPct = Math.max(pctA, pctB, 1)
            return (
              <div key={t.key} className="flex items-center gap-3 mb-3 last:mb-0">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: t.color }} />
                <span className="text-xs text-gray-700 w-[5.5rem] shrink-0">{t.label}</span>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="h-2 bg-gray-100 rounded-sm overflow-hidden">
                    <div
                      className="h-full rounded-sm transition-all duration-500"
                      style={{ width: `${(pctA / maxPct) * 100}%`, background: PANEL_COLORS.A, opacity: 0.75 }}
                    />
                  </div>
                  <div className="h-2 bg-gray-100 rounded-sm overflow-hidden">
                    <div
                      className="h-full rounded-sm transition-all duration-500"
                      style={{ width: `${(pctB / maxPct) * 100}%`, background: PANEL_COLORS.B, opacity: 0.75 }}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5 w-10 shrink-0">
                  <span className="text-[10px] font-mono" style={{ color: PANEL_COLORS.A }}>{pctA}%</span>
                  <span className="text-[10px] font-mono" style={{ color: PANEL_COLORS.B }}>{pctB}%</span>
                </div>
              </div>
            )
          })}
          <div className="flex gap-5 mt-4 pt-3 border-t border-gray-100">
            {(['A', 'B']).map(p => (
              <div key={p} className="flex items-center gap-1.5">
                <div className="w-3 h-2 rounded-sm opacity-75" style={{ background: PANEL_COLORS[p] }} />
                <span className="text-[10px] text-gray-500">Conjunto {p}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
