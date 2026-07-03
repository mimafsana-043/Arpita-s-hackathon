import { mockAlerts, mockDevices } from './mockData.js'

const BACKEND_API_URL = (process.env.BACKEND_API_URL || 'http://localhost:5000').replace(/\/$/, '')
const MOCK_MODE = process.env.MOCK_MODE === 'true'
const REQUEST_TIMEOUT_MS = 5000

class BackendUnavailableError extends Error {
  constructor(message, cause) {
    super(message)
    this.name = 'BackendUnavailableError'
    this.cause = cause
  }
}

async function fetchJson(path) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${BACKEND_API_URL}${path}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Request to ${path} failed with status ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    throw new BackendUnavailableError(`Could not reach backend at ${path}`, error)
  } finally {
    clearTimeout(timer)
  }
}

// Same unwrapping rules as frontend/src/services/api.js, so both sides accept
// either a bare array/object or a { devices | usage | alerts } wrapper.
export const extractDevices = (payload) =>
  Array.isArray(payload) ? payload : payload?.devices

export const extractUsage = (payload) => payload?.usage ?? payload

export const extractAlerts = (payload) =>
  Array.isArray(payload) ? payload : payload?.alerts

export async function fetchDevices() {
  if (MOCK_MODE) return mockDevices

  const devices = extractDevices(await fetchJson('/api/devices'))
  if (!Array.isArray(devices)) {
    throw new BackendUnavailableError('Backend /api/devices response had an unexpected shape')
  }
  return devices
}

export async function fetchUsage() {
  if (MOCK_MODE) return null // let callers derive usage from mock devices

  try {
    return extractUsage(await fetchJson('/api/usage'))
  } catch {
    return null
  }
}

export async function fetchAlerts() {
  if (MOCK_MODE) return mockAlerts

  try {
    const alerts = extractAlerts(await fetchJson('/api/alerts'))
    return Array.isArray(alerts) ? alerts : []
  } catch {
    return []
  }
}

export async function fetchDashboardSnapshot() {
  const [devices, usage, alerts] = await Promise.all([
    fetchDevices(),
    fetchUsage(),
    fetchAlerts(),
  ])
  return { devices, usage, alerts }
}

export { BackendUnavailableError, BACKEND_API_URL, MOCK_MODE }
