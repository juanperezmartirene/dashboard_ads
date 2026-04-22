import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parse } from 'csv-parse/sync'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const csvFile = fs.readFileSync(path.join(__dirname, '../public/data/BD_ids_texto_completo.csv'), 'utf8')
const csvRows = parse(csvFile, {
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true,
}).filter(row => row.id && row.id !== 'id')

const jsonFile = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/realData.json'), 'utf8'))

const errors = []
const warnings = []

console.log('\n📊 Verificación de datos\n')

// Verificar conteo
if (csvRows.length !== jsonFile.length) {
  errors.push(`❌ Conteo inconsistente: CSV tiene ${csvRows.length} filas, JSON tiene ${jsonFile.length} anuncios`)
}

// Verificar campos requeridos
const fieldMissing = {
  part_org: jsonFile.filter(ad => !ad.part_org).length,
  texto_anuncio_completo: jsonFile.filter(ad => !ad.texto_anuncio_completo).length,
  text_body: jsonFile.filter(ad => !ad.text_body).length,
}

Object.entries(fieldMissing).forEach(([field, count]) => {
  if (count > 0) {
    warnings.push(`⚠️  ${count} anuncios sin ${field} (datos incompletos en CSV original)`)
  }
})

// Verificar que text_body === texto_anuncio_completo
let mismatch = 0
jsonFile.forEach((ad, idx) => {
  if (ad.text_body !== ad.texto_anuncio_completo) {
    mismatch++
  }
})
if (mismatch === 0) {
  console.log(`✅ text_body === texto_anuncio_completo en todos los ${jsonFile.length} anuncios`)
} else {
  warnings.push(`⚠️  ${mismatch} anuncios con text_body ≠ texto_anuncio_completo`)
}

// Verificar tipos de datos
let invalidTypes = 0
jsonFile.forEach(ad => {
  if (typeof ad.promedio_impresiones !== 'number') invalidTypes++
  if (typeof ad.promedio_gasto !== 'number') invalidTypes++
  if (typeof ad.disclaimer_faltante !== 'boolean') invalidTypes++
})
if (invalidTypes === 0) {
  console.log(`✅ Tipos de datos correctos en campos numéricos`)
} else {
  warnings.push(`⚠️  ${invalidTypes} valores con tipos de datos incorrectos`)
}

// Verificar partidos únicos
const partidos = new Set(jsonFile.map(ad => ad.part_org).filter(Boolean))
console.log(`✅ Partidos encontrados: ${Array.from(partidos).join(', ')}`)

// Verificar fechas
const fechas = new Set(jsonFile.map(ad => ad.fecha).filter(Boolean))
console.log(`✅ Rango de fechas: ${Array.from(fechas).sort().join(', ')}`)

// Estadísticas
const totalImpresiones = jsonFile.reduce((sum, ad) => sum + (ad.promedio_impresiones || 0), 0)
const totalGasto = jsonFile.reduce((sum, ad) => sum + (ad.promedio_gasto || 0), 0)
console.log(`\n📈 Estadísticas:`)
console.log(`   • Total anuncios: ${jsonFile.length}`)
console.log(`   • Impresiones totales: ${totalImpresiones.toLocaleString('es-UY')}`)
console.log(`   • Gasto total: $${totalGasto.toLocaleString('es-UY')}`)

if (errors.length > 0) {
  console.log(`\n❌ Errores encontrados:`)
  errors.forEach(e => console.log(`   ${e}`))
  process.exit(1)
}

if (warnings.length > 0) {
  console.log(`\n⚠️  Advertencias:`)
  warnings.forEach(w => console.log(`   ${w}`))
}

console.log(`\n✅ Verificación completada exitosamente\n`)
