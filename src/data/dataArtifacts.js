const RUNTIME_BASE = '/data/runtime'

let adsIndexPromise = null
let demographicsPromise = null
let adsManifestPromise = null
let adDetailsManifestPromise = null

const adShardCache = new Map()
const adDetailsShardCache = new Map()

async function loadJson(url, { signal } = {}) {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`${url} respondio HTTP ${response.status}`)
  return response.json()
}

async function loadJsonOptional(url, fallback, options) {
  try {
    return await loadJson(url, options)
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    return fallback
  }
}

export function loadAdsIndex(options) {
  if (!adsIndexPromise) {
    adsIndexPromise = loadJson(`${RUNTIME_BASE}/ads.index.json`, options)
      .catch(error => {
        adsIndexPromise = null
        throw error
      })
  }
  return adsIndexPromise
}

export function loadAdDemographicsIndex(options) {
  if (!demographicsPromise) {
    demographicsPromise = loadJsonOptional(`${RUNTIME_BASE}/ad-demographics.index.json`, {}, options)
      .catch(error => {
        demographicsPromise = null
        throw error
      })
  }
  return demographicsPromise
}

function loadAdsManifest(options) {
  if (!adsManifestPromise) {
    adsManifestPromise = loadJsonOptional(`${RUNTIME_BASE}/ads.manifest.json`, {}, options)
  }
  return adsManifestPromise
}

function loadAdDetailsManifest(options) {
  if (!adDetailsManifestPromise) {
    adDetailsManifestPromise = loadJsonOptional(`${RUNTIME_BASE}/ad-details.manifest.json`, {}, options)
  }
  return adDetailsManifestPromise
}

async function loadShard(cache, url, options) {
  if (!cache.has(url)) {
    cache.set(url, loadJsonOptional(url, {}, options))
  }
  return cache.get(url)
}

export async function loadAdDetailRow(adId, options) {
  const id = String(adId)
  const manifest = await loadAdsManifest()
  const shard = manifest[id]
  if (!shard) return null
  const data = await loadShard(adShardCache, `${RUNTIME_BASE}/ads/${shard}.json`)
  return data[id] || null
}

export async function loadAdBreakdown(adId, options) {
  const id = String(adId)
  const manifest = await loadAdDetailsManifest()
  const shard = manifest[id]
  if (!shard) return null
  const data = await loadShard(adDetailsShardCache, `${RUNTIME_BASE}/ad-details/${shard}.json`)
  return data[id] || null
}
