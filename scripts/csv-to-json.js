import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parse } from 'csv-parse/sync'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function safeParseJSON(str) {
  try {
    if (!str) return []
    return JSON.parse(str.replace(/'/g, '"'))
  } catch {
    return []
  }
}

function stripAccessToken(rawUrl) {
  if (!rawUrl) return rawUrl
  try {
    const url = new URL(rawUrl)
    url.searchParams.delete('access_token')
    return url.toString()
  } catch {
    return String(rawUrl).replace(/([?&])access_token=[^&]+&?/g, '$1').replace(/[?&]$/, '')
  }
}

// Calcular promedio correcto de impresiones considerando rangos abiertos
function calculatePromedioImpresiones(row) {
  const low = parseFloat(row.impressions_low) || 0
  const upp = parseFloat(row.impressions_upp) || 0

  // Si low > 0 pero upp es 0, es rango abierto (>X) - SIEMPRE usar solo low
  // (Ignore CSV's promedio_impresiones in this case as it's incorrect)
  if (low > 0 && upp === 0) {
    return low
  }

  // Si ambos > 0, calcular promedio
  if (low > 0 && upp > 0) {
    return (low + upp) / 2
  }

  // Si ya hay promedio válido y es > 0, usarlo (solo si los ranges no son abiertos)
  if (row.promedio_impresiones && parseFloat(row.promedio_impresiones) > 0) {
    return parseFloat(row.promedio_impresiones)
  }

  return 0
}

// Calcular promedio correcto de gasto considerando rangos abiertos
function calculatePromedioGasto(row) {
  const low = parseFloat(row.spend_low) || 0
  const upp = parseFloat(row.spend_upp) || 0

  // Si low > 0 pero upp es 0, es rango abierto (>X) - SIEMPRE usar solo low
  // (Ignore CSV's promedio_gasto in this case as it's incorrect)
  if (low > 0 && upp === 0) {
    return low
  }

  // Si ambos > 0, calcular promedio
  if (low > 0 && upp > 0) {
    return (low + upp) / 2
  }

  // Si ya hay promedio válido y es > 0, usarlo (solo si los ranges no son abiertos)
  if (row.promedio_gasto && parseFloat(row.promedio_gasto) > 0) {
    return parseFloat(row.promedio_gasto)
  }

  return 0
}

const csvFile = fs.readFileSync(path.join(__dirname, '../public/data/BD_v2.csv'), 'utf8')
const records = parse(csvFile, {
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true,
})
const rows = records.filter(row => row.id && row.id !== 'id')

const anuncios = rows.map(row => ({
    id: row.id,
    page_id: row.page_id,
    page_name: row.page_name,
    ad_creation_time: row.ad_creation_time,
    ad_delivery_start_time: row.ad_delivery_start_time,
    ad_delivery_stop_time: row.ad_delivery_stop_time,
    bylines: row.bylines,
    ad_snapshot_url: stripAccessToken(row.ad_snapshot_url),
    ad_creative_bodies: safeParseJSON(row.ad_creative_bodies),
    currency: row.currency,
    languages: safeParseJSON(row.languages),
    publisher_platforms: safeParseJSON(row.publisher_platforms),
    estimated_audience_size_low: parseInt(row.estimated_audience_size_low) || 0,
    estimated_audience_size_upp: parseInt(row.estimated_audience_size_upp) || 0,
    impressions_low: parseInt(row.impressions_low) || 0,
    impressions_upp: parseInt(row.impressions_upp) || 0,
    spend_low: parseFloat(row.spend_low) || 0,
    spend_upp: parseFloat(row.spend_upp) || 0,
    demographic_distribution: safeParseJSON(row.demographic_distribution),
    delivery_by_region: safeParseJSON(row.delivery_by_region),
    part_org: row.part_org,
    pre_pres: row.pre_pres,
    lista_sector_candidato: row.lista_sector_candidato,
    departamento_nacional: row.departamento_nacional,
    fecha: row.fecha,
    dolar_prom: parseFloat(row.dolar_prom) || 0,
    promedio_impresiones: calculatePromedioImpresiones(row),
    promedio_gasto: calculatePromedioGasto(row),
    eficiencia: parseFloat(row.eficiencia) || 0,
    tipo_eleccion: row.tipo_eleccion,
    disclaimer_faltante: row.disclaimer_faltante === 'True',
    anuncio_removido: row.anuncio_removido === 'True',
    tipo: row.tipo,
    text_body: row.texto_anuncio_completo,
    transcripcion: row.transcripcion,
    texto_ocr: row.texto_ocr,
    texto_anuncio_completo: row.texto_anuncio_completo,
  }))

fs.writeFileSync(
  path.join(__dirname, '../public/data/realData.json'),
  JSON.stringify(anuncios, null, 2)
)

console.log(`✓ Convertido: ${anuncios.length} anuncios → realData.json`)
