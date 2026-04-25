import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parse } from 'csv-parse/sync'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const csvFile = fs.readFileSync(path.join(__dirname, '../public/data/BD_v2.csv'), 'utf8')
const csvRows = parse(csvFile, {
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true,
}).filter(row => row.id && row.id !== 'id')

const jsonFile = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/realData.json'), 'utf8'))
const clasifPath = path.join(__dirname, '../public/data/clasificacion.json')
const clasificacion = fs.existsSync(clasifPath)
  ? JSON.parse(fs.readFileSync(clasifPath, 'utf8'))
  : null
const runtimeDir = path.join(__dirname, '../public/data/runtime')
const adsIndexPath = path.join(runtimeDir, 'ads.index.json')
const adDemoIndexPath = path.join(runtimeDir, 'ad-demographics.index.json')
const adsManifestPath = path.join(runtimeDir, 'ads.manifest.json')
const adDetailsManifestPath = path.join(runtimeDir, 'ad-details.manifest.json')

const errors = []
const warnings = []

function parseNumber(value) {
  const parsed = parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function expectedSpendAverageUsd(ad) {
  const rate = parseNumber(ad.dolar_prom) || 1
  const low = parseNumber(ad.spend_low_original ?? ad.spend_low)
  const upp = parseNumber(ad.spend_upp_original ?? ad.spend_upp)
  const lowUsd = ad.currency === 'UYU' ? low / rate : low
  const uppUsd = ad.currency === 'UYU' ? upp / rate : upp
  if (lowUsd > 0 && uppUsd > 0 && lowUsd !== uppUsd) return (lowUsd + uppUsd) / 2
  if (lowUsd > 0) return lowUsd
  if (uppUsd > 0) return uppUsd / 2
  return 0
}

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

// Verificar que no se publiquen tokens o credenciales en datos estáticos
let tokenLeaks = 0
jsonFile.forEach(ad => {
  Object.values(ad).forEach(value => {
    if (typeof value === 'string' && value.includes('access_token')) tokenLeaks++
  })
})
if (tokenLeaks > 0) {
  errors.push(`❌ Se encontraron ${tokenLeaks} campos con access_token en public/data/realData.json`)
}

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

if (clasificacion) {
  const clasifCount = Object.keys(clasificacion).length
  const ids = new Set(jsonFile.map(ad => String(ad.id)))
  const orphanClasif = Object.keys(clasificacion).filter(id => !ids.has(id)).length
  console.log(`   • Clasificaciones disponibles: ${clasifCount.toLocaleString('es-UY')}`)
  if (clasifCount !== jsonFile.length) {
    warnings.push(`⚠️  La clasificación es provisoria/incompleta: ${clasifCount} clasificaciones para ${jsonFile.length} anuncios`)
  }
  if (orphanClasif > 0) {
    warnings.push(`⚠️  ${orphanClasif} clasificaciones no corresponden a IDs de realData.json`)
  }
}

// Verificar artefactos runtime livianos/shardeados
if (!fs.existsSync(adsIndexPath)) {
  errors.push(`❌ Falta public/data/runtime/ads.index.json. Ejecutá npm.cmd run prepare-data`)
} else {
  const adsIndex = JSON.parse(fs.readFileSync(adsIndexPath, 'utf8'))
  if (!Array.isArray(adsIndex) || adsIndex.length !== jsonFile.length) {
    errors.push(`❌ ads.index.json no coincide con realData.json (${adsIndex.length} vs ${jsonFile.length})`)
  }

  let runtimeTokenLeaks = 0
  adsIndex.forEach(ad => {
    Object.values(ad).forEach(value => {
      if (typeof value === 'string' && value.includes('access_token')) runtimeTokenLeaks++
    })
  })
  if (runtimeTokenLeaks > 0) {
    errors.push(`❌ Se encontraron ${runtimeTokenLeaks} campos con access_token en public/data/runtime/ads.index.json`)
  }

  let spendConversionMismatches = 0
  adsIndex.forEach(ad => {
    const expected = expectedSpendAverageUsd(ad)
    const actual = parseNumber(ad.promedio_gasto)
    const hasRange = parseNumber(ad.spend_low_original) > 0 || parseNumber(ad.spend_upp_original) > 0
    if (hasRange && Math.abs(actual - expected) > 0.000001) spendConversionMismatches++
  })
  if (spendConversionMismatches > 0) {
    errors.push(`Gasto promedio runtime inconsistente con el rango convertido a USD en ${spendConversionMismatches} anuncios`)
  } else {
    console.log(`Gasto runtime convertido a USD y promediado desde rangos`)
  }

  const rawSize = fs.statSync(path.join(__dirname, '../public/data/realData.json')).size
  const indexSize = fs.statSync(adsIndexPath).size
  console.log(`   • Índice runtime: ${(indexSize / 1024 / 1024).toFixed(2)} MB (${((1 - indexSize / rawSize) * 100).toFixed(1)}% menos que realData.json)`)
}

if (!fs.existsSync(adsManifestPath)) {
  errors.push(`❌ Falta public/data/runtime/ads.manifest.json`)
}

if (!fs.existsSync(adDetailsManifestPath)) {
  errors.push(`❌ Falta public/data/runtime/ad-details.manifest.json`)
}

if (fs.existsSync(adDemoIndexPath)) {
  const demoIndex = JSON.parse(fs.readFileSync(adDemoIndexPath, 'utf8'))
  console.log(`   • Índice demográfico runtime: ${Object.keys(demoIndex).length.toLocaleString('es-UY')} anuncios`)
} else {
  warnings.push(`⚠️  Falta public/data/runtime/ad-demographics.index.json; los gráficos demográficos no tendrán datos`)
}

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
