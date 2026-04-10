import { useMemo } from 'react'
import { useFilteredData } from '../hooks/useFilteredData'
import ComparisonPanel from './ComparisonPanel'

export default function PageComparacion({ tableData, adDetails, pagePartyMap }) {
  const fdA = useFilteredData(tableData, adDetails)
  const fdB = useFilteredData(tableData, adDetails)

  // Dominios compartidos para que los gráficos sean comparables entre paneles
  const sharedDomains = useMemo(() => {
    // Escala eje X de barras por partido (por cada métrica)
    const partyAll = [...fdA.filteredStats.byParty, ...fdB.filteredStats.byParty]
    const party = {
      anuncios:    Math.max(...partyAll.map(p => p.anuncios    || 0), 1),
      impresiones: Math.max(...partyAll.map(p => p.impresiones || 0), 1),
      gasto:       Math.max(...partyAll.map(p => p.gasto       || 0), 1),
    }

    // Escala del mapa coroplético (por cada métrica)
    const deptAll = [...fdA.deptData, ...fdB.deptData]
    const dept = {
      impresiones: Math.max(...deptAll.map(d => d.impresiones || 0), 1),
      anuncios:    Math.max(...deptAll.map(d => d.anuncios    || 0), 1),
      gasto:       Math.max(...deptAll.map(d => d.gasto       || 0), 1),
    }

    // Escala eje Y del line chart: compartida solo si ambos paneles usan la misma métrica
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
    <div
      className="border-t border-gray-100"
      style={{ backgroundColor: '#F9FAFB' }}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 md:py-14">
        {/* Header de sección */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <p className="text-xs font-medium tracking-widest mb-2 uppercase" style={{ color: '#0096D1' }}>
            Comparación
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Comparación de conjuntos de anuncios
          </h2>
          <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
            Aplicá filtros independientes en cada panel para contrastar partidos,
            etapas electorales o territorios de forma simultánea.
            Cada panel mantiene su propio estado de filtros.
          </p>
        </div>

        {/* Grid de paneles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <ComparisonPanel
            label="Panel A"
            accentColor="#173363"
            fd={fdA}
            sharedDomains={sharedDomains}
            pagePartyMap={pagePartyMap}
          />
          <ComparisonPanel
            label="Panel B"
            accentColor="#0096D1"
            fd={fdB}
            sharedDomains={sharedDomains}
            pagePartyMap={pagePartyMap}
          />
        </div>
      </div>
    </div>
  )
}
