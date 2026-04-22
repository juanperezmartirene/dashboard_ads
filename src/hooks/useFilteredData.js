import { useState, useMemo } from 'react'
import {
  computeDeptDistribution,
  computeFilteredStats,
  computeTimeSeries,
  computeAggregateDemographicsWithGasto,
  computeGastoGenero,
} from '../data/processRealData'

export function useFilteredData(tableData, adDetails) {
  const [selectedParties,      setSelectedParties]      = useState([])
  const [selectedEtapa,        setSelectedEtapa]        = useState('Todas')
  const [selectedTerritorio,   setSelectedTerritorio]   = useState([])
  const [selectedDepartamento, setSelectedDepartamento] = useState('Todos')
  const [selectedPrecandidato, setSelectedPrecandidato] = useState('Todos')
  const [lineMetric,           setLineMetric]           = useState('anuncios')
  const [partyMetric,          setPartyMetric]          = useState('anuncios')
  const [deptMetric,           setDeptMetric]           = useState('impresiones')
  const [demoMetric,           setDemoMetric]           = useState('impresiones')

  const handleSetEtapa = (e) => {
    setSelectedEtapa(e)
    if (e !== 'Internas') setSelectedPrecandidato('Todos')
  }

  const filteredBase = useMemo(() => {
    let rows = tableData
    if (selectedParties.length > 0)
      rows = rows.filter(r => selectedParties.includes(r.part_org_normalized))
    if (selectedEtapa !== 'Todas')
      rows = rows.filter(r => r.etapa === selectedEtapa)
    if (selectedTerritorio.length > 0) {
      rows = rows.filter(r => {
        const d = r.departamento_nacional
        if (selectedTerritorio.includes('Nacional') && (!d || d === 'Nacional')) return true
        if (selectedTerritorio.includes('Montevideo') && d === 'Montevideo') return true
        if (selectedTerritorio.includes('Interior') && d && d !== 'Nacional' && d !== 'Montevideo') return true
        return false
      })
    }
    if (selectedDepartamento !== 'Todos')
      rows = rows.filter(r => r.departamento_nacional === selectedDepartamento)
    return rows
  }, [tableData, selectedParties, selectedEtapa, selectedTerritorio, selectedDepartamento])

  const precandidatosList = useMemo(() => {
    if (selectedEtapa !== 'Internas') return []
    const set = new Set()
    filteredBase.forEach(r => { if (r.pre_pres_display) set.add(r.pre_pres_display) })
    return [...set].sort()
  }, [filteredBase, selectedEtapa])

  const filteredTable = useMemo(() => {
    if (selectedEtapa !== 'Internas' || selectedPrecandidato === 'Todos') return filteredBase
    return filteredBase.filter(r => r.pre_pres_display === selectedPrecandidato)
  }, [filteredBase, selectedPrecandidato, selectedEtapa])

  const deptData = useMemo(() => computeDeptDistribution(filteredTable), [filteredTable])
  const filteredStats = useMemo(() => computeFilteredStats(filteredTable), [filteredTable])
  const timeSeries = useMemo(() => computeTimeSeries(filteredTable, lineMetric), [filteredTable, lineMetric])
  const demoData = useMemo(
    () => adDetails ? computeAggregateDemographicsWithGasto(filteredTable, adDetails) : [],
    [filteredTable, adDetails]
  )
  const gastoGenero = useMemo(
    () => adDetails ? computeGastoGenero(filteredTable, adDetails) : null,
    [filteredTable, adDetails]
  )

  const hasFilters = selectedParties.length > 0 || selectedEtapa !== 'Todas'
    || selectedTerritorio.length > 0 || selectedDepartamento !== 'Todos'
    || selectedPrecandidato !== 'Todos'

  return {
    selectedParties,      setSelectedParties,
    selectedEtapa,        setSelectedEtapa: handleSetEtapa,
    selectedTerritorio,   setSelectedTerritorio,
    selectedDepartamento, setSelectedDepartamento,
    selectedPrecandidato, setSelectedPrecandidato,
    precandidatosList,
    lineMetric,           setLineMetric,
    partyMetric,          setPartyMetric,
    deptMetric,           setDeptMetric,
    demoMetric,           setDemoMetric,
    filteredTable,
    deptData,
    filteredStats,
    timeSeries,
    demoData,
    gastoGenero,
    hasFilters,
  }
}
