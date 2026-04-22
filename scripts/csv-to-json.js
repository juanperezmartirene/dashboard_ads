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

const csvFile = fs.readFileSync(path.join(__dirname, '../public/data/BD_ids_texto_completo.csv'), 'utf8')
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
    ad_snapshot_url: row.ad_snapshot_url,
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
    promedio_impresiones: parseFloat(row.promedio_impresiones) || 0,
    promedio_gasto: parseFloat(row.promedio_gasto) || 0,
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
