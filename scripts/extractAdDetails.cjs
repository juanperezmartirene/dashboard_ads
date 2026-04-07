/**
 * Extrae demographic_distribution y delivery_by_region de los CSVs crudos
 * y genera public/data/adDetails.json con la estructura:
 * {
 *   "<ad_id>": {
 *     "demo": [{ age, gender, pct }],
 *     "region": [{ region, pct }]
 *   }
 * }
 *
 * Uso: node scripts/extractAdDetails.js
 */

const fs = require('fs')
const path = require('path')

const RAW_DIRS = [
  path.resolve(__dirname, '../../AUCIP/GIT/scripts/data/raw/elecciones_2024'),
  path.resolve(__dirname, '../../AUCIP/GIT/scripts/data/raw/elecciones_2024_faltante'),
]
const REAL_DATA = path.resolve(__dirname, '../public/data/realData.json')
const OUTPUT = path.resolve(__dirname, '../public/data/adDetails.json')

// IDs válidos del dataset actual
const realData = JSON.parse(fs.readFileSync(REAL_DATA, 'utf8'))
const validIds = new Set(realData.map(r => String(r.id)))
console.log(`IDs en realData.json: ${validIds.size}`)

// Parsear la representación Python de listas de dicts: [{'key': 'val'}, ...]
function parsePythonList(raw) {
  if (!raw || raw === '' || raw === 'nan' || raw === 'NaN') return null
  // Remove surrounding quotes if present
  let s = raw.trim()
  if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1)
  if (!s.startsWith('[')) return null
  // Convert Python single quotes to JSON double quotes
  // Handle the pattern: {'key': 'value'}
  s = s.replace(/'/g, '"')
  try {
    return JSON.parse(s)
  } catch {
    return null
  }
}

// Parsear una línea CSV que puede tener campos con comillas y comas internas
function parseCSVLine(line) {
  const fields = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  fields.push(current)
  return fields
}

const REGION_MAP = {
  'Artigas Department': 'Artigas',
  'Canelones Department': 'Canelones',
  'Cerro Largo Department': 'Cerro Largo',
  'Colonia Department': 'Colonia',
  'Durazno Department': 'Durazno',
  'Florida Department': 'Florida',
  'Flores Department': 'Flores',
  'Lavalleja Department': 'Lavalleja',
  'Maldonado Department': 'Maldonado',
  'Montevideo Department': 'Montevideo',
  'Paysandú Department': 'Paysandú',
  'Río Negro Department': 'Río Negro',
  'Rivera Department': 'Rivera',
  'Rocha Department': 'Rocha',
  'Salto Department': 'Salto',
  'San José Department': 'San José',
  'Soriano Department': 'Soriano',
  'Tacuarembó Department': 'Tacuarembó',
  'Treinta y Tres Department': 'Treinta y Tres',
}

const result = {}
let totalFiles = 0

for (const RAW_DIR of RAW_DIRS) {
  if (!fs.existsSync(RAW_DIR)) { console.log(`Saltando ${RAW_DIR} (no existe)`); continue }
  const csvFiles = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.csv')).sort()
  totalFiles += csvFiles.length
  console.log(`Procesando ${csvFiles.length} archivos en ${path.basename(RAW_DIR)}...`)

let processed = 0
let matched = 0

for (const file of csvFiles) {
  const content = fs.readFileSync(path.join(RAW_DIR, file), 'utf8')
  const lines = content.split('\n')
  if (lines.length < 2) continue

  // Find column indices from header
  const header = parseCSVLine(lines[0].replace(/^\uFEFF/, '')) // strip BOM
  const idIdx = header.indexOf('id')
  const demoIdx = header.indexOf('demographic_distribution')
  const regionIdx = header.indexOf('delivery_by_region')

  if (idIdx === -1 || demoIdx === -1 || regionIdx === -1) continue

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    processed++

    const fields = parseCSVLine(line)
    const adId = String(fields[idIdx]).trim()

    if (!validIds.has(adId)) continue
    if (result[adId]) continue // already have this ad

    const demoRaw = fields[demoIdx]
    const regionRaw = fields[regionIdx]

    const demoArr = parsePythonList(demoRaw)
    const regionArr = parsePythonList(regionRaw)

    const entry = {}

    if (demoArr && demoArr.length > 0) {
      entry.demo = demoArr.map(d => ({
        age: d.age,
        gender: d.gender,
        pct: parseFloat(d.percentage),
      })).filter(d => d.age && d.gender && !isNaN(d.pct))
    }

    if (regionArr && regionArr.length > 0) {
      entry.region = regionArr
        .filter(r => r.region !== 'Unknown')
        .map(r => ({
          region: REGION_MAP[r.region] || r.region.replace(' Department', ''),
          pct: parseFloat(r.percentage),
        }))
        .filter(r => !isNaN(r.pct))
        .sort((a, b) => b.pct - a.pct)
    }

    if (entry.demo || entry.region) {
      result[adId] = entry
      matched++
    }
  }
}

console.log(`  Registros en este dir: ${processed}, matched: ${matched}`)
} // end RAW_DIRS loop

const totalMatched = Object.keys(result).length
console.log(`\nTotal anuncios con datos demográficos/regionales: ${totalMatched}`)
console.log(`IDs sin match: ${validIds.size - totalMatched}`)

fs.writeFileSync(OUTPUT, JSON.stringify(result), 'utf8')
const sizeMB = (fs.statSync(OUTPUT).size / 1024 / 1024).toFixed(2)
console.log(`Guardado: ${OUTPUT} (${sizeMB} MB)`)
