import { useMemo } from 'react'
import { useFilteredData } from '../hooks/useFilteredData'
import ComparisonPanel from './ComparisonPanel'

// Tonalidades del mismo azul/teal — mismo matiz, distinta luminosidad
const COLOR_A = '#0284C7'  // sky-600  (más oscuro)
const COLOR_B = '#38BDF8'  // sky-400  (más claro)

export default function PageComparacion({ tableData, adDetails, adDetailsLoading, pagePartyMap }) {
  const fdA = useFilteredData(tableData, adDetails)
  const fdB = useFilteredData(tableData, adDetails)

  const sharedDomains = useMemo(() => {
    const partyAll = [...fdA.filteredStats.byParty, ...fdB.filteredStats.byParty]
    const party = {
      anuncios:    Math.max(...partyAll.map(p => p.anuncios    || 0), 1),
      impresiones: Math.max(...partyAll.map(p => p.impresiones || 0), 1),
      gasto:       Math.max(...partyAll.map(p => p.gasto       || 0), 1),
    }

    const deptAll = [...fdA.deptData, ...fdB.deptData]
    const dept = {
      impresiones: Math.max(...deptAll.map(d => d.impresiones || 0), 1),
      anuncios:    Math.max(...deptAll.map(d => d.anuncios    || 0), 1),
      gasto:       Math.max(...deptAll.map(d => d.gasto       || 0), 1),
    }

    let lineYMax = null
    if (fdA.lineMetric === fdB.lineMetric) {
      const maxA = fdA.timeSeries.length ? Math.max(...fdA.timeSeries.map(r => r.total || 0)) : 0
      const maxB = fdB.timeSeries.length ? Math.max(...fdB.timeSeries.map(r => r.total || 0)) : 0
      lineYMax = Math.max(maxA, maxB, 1)
    }

    return { party, dept, lineYMax }
  }, [
    fdA.filteredStats.byParty, fdB.filteredStats.byParty,
    fdA.deptData,              fdB.deptData,
    fdA.timeSeries,            fdB.timeSeries,
    fdA.lineMetric,            fdB.lineMetric,
  ])

  return (
    <div className="border-t border-gray-100" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 md:py-14">

        {/* Leyenda */}
        <div className="flex items-center gap-6 mb-8">
          {[{ p: 'A', color: COLOR_A, fd: fdA }, { p: 'B', color: COLOR_B, fd: fdB }].map(({ p, color, fd }) => {
            const parts = []
            if (fd.selectedParties.length) parts.push(fd.selectedParties.join(', '))
            if (fd.selectedEtapa !== 'Todas') parts.push(fd.selectedEtapa)
            if (fd.selectedTerritorio.length) parts.push(fd.selectedTerritorio.join(', '))
            const summary = parts.length ? parts.join(' · ') : 'Todos los anuncios'
            return (
              <div key={p} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
                <span className="text-sm font-semibold text-gray-700">Conjunto {p}</span>
                <span className="text-xs text-gray-400">{summary}</span>
              </div>
            )
          })}
          <p className="ml-auto text-xs text-gray-400">
            Las escalas reflejan el máximo entre ambos conjuntos
          </p>
        </div>

        {/* Grid de paneles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <ComparisonPanel
            label="Panel A"
            accentColor={COLOR_A}
            fd={fdA}
            sharedDomains={sharedDomains}
            pagePartyMap={pagePartyMap}
            adDetailsLoading={adDetailsLoading}
          />
          <ComparisonPanel
            label="Panel B"
            accentColor={COLOR_B}
            fd={fdB}
            sharedDomains={sharedDomains}
            pagePartyMap={pagePartyMap}
            adDetailsLoading={adDetailsLoading}
          />
        </div>
      </div>
    </div>
  )
}
