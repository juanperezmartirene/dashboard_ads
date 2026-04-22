/**
 * Centralized filtering logic for dashboard
 * Single source of truth for all filter computations
 * Used by: App.jsx (Home page), useFilteredData.js (Comparación page)
 */

/**
 * Compute filtered base rows based on party, etapa, territorio, and departamento filters
 * This is the core filtering logic shared across all pages
 */
export function computeFilteredBase(tableData, {
  selectedParties = [],
  selectedEtapa = 'Todas',
  selectedTerritorio = [],
  selectedDepartamento = 'Todos',
} = {}) {
  let rows = tableData

  // Filter by political parties
  if (selectedParties.length > 0) {
    rows = rows.filter(r => selectedParties.includes(r.part_org_normalized))
  }

  // Filter by electoral stage
  if (selectedEtapa !== 'Todas') {
    rows = rows.filter(r => r.etapa === selectedEtapa)
  }

  // Filter by territory (Nacional/Montevideo/Interior)
  if (selectedTerritorio.length > 0) {
    rows = rows.filter(r => {
      const d = r.departamento_nacional
      if (selectedTerritorio.includes('Nacional') && (!d || d === 'Nacional')) return true
      if (selectedTerritorio.includes('Montevideo') && d === 'Montevideo') return true
      if (selectedTerritorio.includes('Interior') && d && d !== 'Nacional' && d !== 'Montevideo') return true
      return false
    })
  }

  // Filter by specific department
  if (selectedDepartamento !== 'Todos') {
    rows = rows.filter(r => r.departamento_nacional === selectedDepartamento)
  }

  return rows
}

/**
 * Handle etapa (electoral stage) change with side effects
 * When changing to/from 'Internas', precandidato should reset
 */
export function handleEtapaChange(newEtapa, setSelectedEtapa, setSelectedPrecandidato) {
  setSelectedEtapa(newEtapa)
  // Only Internas stage supports precandidato filtering
  if (newEtapa !== 'Internas') {
    setSelectedPrecandidato('Todos')
  }
}
