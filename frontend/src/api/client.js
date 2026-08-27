/**
 * api/client.js
 * --------------
 * Thin client around the FastAPI backend.
 * - Defaults to the Vite dev proxy (no CORS issue): /api/*
 * - If VITE_API_URL is set, uses that absolute base instead.
 * - Caches the last hospital list in localStorage so the app can show
 *   something useful while offline.
 */

const BASE = import.meta.env.VITE_API_URL || '/api'
const CACHE_KEY = 'asl:last-hospitals'

async function http(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${path} failed: ${res.status} ${text}`)
  }
  return res.json()
}

export async function classifyUrgency(symptoms, language = 'en') {
  return http('/classify-urgency', {
    method: 'POST',
    body: JSON.stringify({ symptoms, language }),
  })
}

export async function matchHospital(urgency, symptoms = '', language = 'en') {
  return http('/match-hospital', {
    method: 'POST',
    body: JSON.stringify({ urgency, symptoms, language }),
  })
}

export async function fetchHospitals() {
  try {
    const data = await http('/hospitals')
    if (data?.hospitals) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data.hospitals))
      } catch {/* localStorage might be disabled */}
    }
    return { hospitals: data.hospitals || [], offline: false }
  } catch (err) {
    // Network failed — fall back to cache
    const cached = readCache()
    return { hospitals: cached, offline: true }
  }
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export { readCache as readCachedHospitals }
