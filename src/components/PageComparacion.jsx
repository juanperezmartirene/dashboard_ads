import ComparisonPanel from './ComparisonPanel'

export default function PageComparacion({ tableData, adDetails, pagePartyMap }) {
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
            tableData={tableData}
            adDetails={adDetails}
            pagePartyMap={pagePartyMap}
          />
          <ComparisonPanel
            label="Panel B"
            accentColor="#0096D1"
            tableData={tableData}
            adDetails={adDetails}
            pagePartyMap={pagePartyMap}
          />
        </div>
      </div>
    </div>
  )
}
