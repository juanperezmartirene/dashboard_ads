import FilterPanel from './FilterPanel'
import DataTable from './DataTable'
import {
  ChartBox,
  HomeKPIs,
  HomePartyChart,
  HomeDeptMap,
  HomeLineChart,
  HomeDemoPyramid,
  HomeTop5,
} from './HomeCharts'

export default function ComparisonPanel({
  label, accentColor, fd, sharedDomains, pagePartyMap, adDetailsLoading,
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Etiqueta del panel */}
      <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
        <span
          className="text-xs font-mono font-bold px-2 py-0.5 rounded-sm"
          style={{ backgroundColor: accentColor + '22', color: accentColor }}
        >
          {label}
        </span>
        {fd.hasFilters && (
          <span className="text-xs font-medium" style={{ color: accentColor }}>Filtros activos</span>
        )}
      </div>

      {/* Filtros */}
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
        defaultOpen={true}
      />

      {/* KPIs compactos */}
      <HomeKPIs stats={fd.filteredStats} compact />

      {/* Anuncios por partido — escala X compartida */}
      <ChartBox
        title="Anuncios por partido"
        sub="Solo partidos con anuncios según los filtros activos."
      >
        <HomePartyChart stats={fd.filteredStats} xDomain={sharedDomains.party} metric={fd.partyMetric} onMetricChange={fd.setPartyMetric} />
      </ChartBox>

      {/* Mapa departamental — normalización compartida */}
      <ChartBox
        title="Distribución por departamento"
        sub="Solo anuncios con alcance departamental."
      >
        <HomeDeptMap data={fd.deptData} extMaxVal={sharedDomains.dept} metric={fd.deptMetric} onMetricChange={fd.setDeptMetric} />
      </ChartBox>

      {/* Evolución temporal — escala Y compartida si misma métrica */}
      <ChartBox
        title="Evolución temporal de anuncios"
        sub="Publicaciones por semana según los filtros activos."
      >
        <HomeLineChart
          data={fd.timeSeries}
          metricKey={fd.lineMetric}
          onMetricChange={fd.setLineMetric}
          yMax={sharedDomains.lineYMax}
        />
      </ChartBox>

      {/* Demografía */}
      <ChartBox title="Demografía de audiencia" sub="Edad y género · estimación Meta Ad Library.">
        <HomeDemoPyramid data={fd.demoData} loading={adDetailsLoading} gastoGenero={fd.gastoGenero} metric={fd.demoMetric} onMetricChange={fd.setDemoMetric} />
      </ChartBox>

      {/* Top 5 cuentas */}
      <ChartBox
        title="Top 5 cuentas"
        sub="Ranking de las principales cuentas anunciantes según los filtros activos."
      >
        <HomeTop5 top5={fd.filteredStats.top5} pagePartyMap={pagePartyMap} />
      </ChartBox>

      {/* Tabla de anuncios */}
      <DataTable data={fd.filteredTable} />
    </div>
  )
}
