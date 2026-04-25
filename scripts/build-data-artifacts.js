import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { processData, mergeClasificacion } from '../src/data/processRealData.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dataDir = path.join(root, 'public', 'data')
const runtimeDir = path.join(dataDir, 'runtime')
const adShardDir = path.join(runtimeDir, 'ads')
const detailsShardDir = path.join(runtimeDir, 'ad-details')

const REAL_DATA = path.join(dataDir, 'realData.json')
const AD_DETAILS = path.join(dataDir, 'adDetails.json')
const CLASIFICACION = path.join(dataDir, 'clasificacion.json')
const SHARD_COUNT = 100

const INDEX_FIELDS = [
  'id',
  'page_id',
  'page_name',
  'ad_creation_time',
  'ad_delivery_start_time',
  'ad_delivery_stop_time',
  'currency',
  'publisher_platforms',
  'impressions_low',
  'impressions_upp',
  'spend_low',
  'spend_upp',
  'spend_lower',
  'spend_upper',
  'spend_low_original',
  'spend_upp_original',
  'spend_currency_original',
  'spend_low_usd',
  'spend_upp_usd',
  'spend_range_currency',
  'part_org',
  'pre_pres',
  'lista_sector_candidato',
  'departamento_nacional',
  'departamento_code',
  'fecha',
  'dolar_prom',
  'promedio_impresiones',
  'promedio_gasto',
  'eficiencia',
  'tipo_eleccion',
  'tipo',
  'text_body',
  'part_org_normalized',
  'etapa',
  '_gasto',
  '_impresiones',
  'pre_pres_display',
  '_clasi',
]

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function ensureCleanDir(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
  fs.mkdirSync(dir, { recursive: true })
}

function shardKey(id) {
  const digits = String(id ?? '').replace(/\D/g, '')
  const numeric = digits ? Number(digits.slice(-8)) : hashString(String(id ?? ''))
  return String(numeric % SHARD_COUNT).padStart(2, '0')
}

function hashString(value) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function pick(row, fields) {
  const out = {}
  fields.forEach(field => {
    if (row[field] !== undefined) out[field] = row[field]
  })
  return out
}

function writeJson(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data)}\n`)
}

function addToShard(shards, id, value) {
  const key = shardKey(id)
  if (!shards[key]) shards[key] = {}
  shards[key][String(id)] = value
  return key
}

function fileSize(file) {
  return fs.existsSync(file) ? fs.statSync(file).size : 0
}

function formatMb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

const rawRows = readJson(REAL_DATA, null)
if (!Array.isArray(rawRows)) {
  throw new Error(`No se pudo leer ${REAL_DATA}`)
}

const clasificacion = readJson(CLASIFICACION, {})
const processedRows = mergeClasificacion(processData(rawRows), clasificacion)
const adDetails = readJson(AD_DETAILS, {})

ensureCleanDir(runtimeDir)
fs.mkdirSync(adShardDir, { recursive: true })
fs.mkdirSync(detailsShardDir, { recursive: true })

const adsIndex = []
const adsShards = {}
const adsManifest = {}

processedRows.forEach(row => {
  adsIndex.push(pick(row, INDEX_FIELDS))
  adsManifest[String(row.id)] = addToShard(adsShards, row.id, row)
})

Object.entries(adsShards).forEach(([key, value]) => {
  writeJson(path.join(adShardDir, `${key}.json`), value)
})

const detailsShards = {}
const detailsManifest = {}
const demoIndex = {}

Object.entries(adDetails).forEach(([id, detail]) => {
  detailsManifest[id] = addToShard(detailsShards, id, detail)
  if (detail?.demo) demoIndex[id] = { demo: detail.demo }
})

Object.entries(detailsShards).forEach(([key, value]) => {
  writeJson(path.join(detailsShardDir, `${key}.json`), value)
})

const meta = {
  generatedAt: new Date().toISOString(),
  source: {
    realData: 'public/data/realData.json',
    adDetails: 'public/data/adDetails.json',
    clasificacion: 'public/data/clasificacion.json',
  },
  counts: {
    ads: processedRows.length,
    classified: Object.keys(clasificacion).length,
    adDetails: Object.keys(adDetails).length,
    adDetailsWithDemo: Object.keys(demoIndex).length,
  },
  shardCount: SHARD_COUNT,
  indexFields: INDEX_FIELDS,
}

writeJson(path.join(runtimeDir, 'ads.index.json'), adsIndex)
writeJson(path.join(runtimeDir, 'ads.manifest.json'), adsManifest)
writeJson(path.join(runtimeDir, 'ad-details.manifest.json'), detailsManifest)
writeJson(path.join(runtimeDir, 'ad-demographics.index.json'), demoIndex)
writeJson(path.join(runtimeDir, 'meta.json'), meta)

console.log('\nArtefactos de datos generados')
console.log(`- ads.index.json: ${formatMb(fileSize(path.join(runtimeDir, 'ads.index.json')))} (${adsIndex.length} anuncios)`)
console.log(`- ads shards: ${Object.keys(adsShards).length} archivos`)
console.log(`- ad-demographics.index.json: ${formatMb(fileSize(path.join(runtimeDir, 'ad-demographics.index.json')))}`)
console.log(`- ad-details shards: ${Object.keys(detailsShards).length} archivos\n`)
