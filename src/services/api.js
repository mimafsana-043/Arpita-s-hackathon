export const BACKEND_URL = (
  import.meta.env?.VITE_BACKEND_URL || 'http://localhost:5000'
).replace(/\/$/, '')

const fetchJson = async (path) => {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
}

export const extractDevices = (payload) =>
  Array.isArray(payload) ? payload : payload?.devices

export const extractUsage = (payload) => payload?.usage ?? payload

export const extractAlerts = (payload) =>
  Array.isArray(payload) ? payload : payload?.alerts

export async function fetchDashboardSnapshot() {
  const [devicesPayload, usagePayload, alertsPayload] = await Promise.all([
    fetchJson('/api/devices'),
    fetchJson('/api/usage').catch(() => null),
    fetchJson('/api/alerts').catch(() => null),
  ])

  const devices = extractDevices(devicesPayload)
  const alerts = extractAlerts(alertsPayload)

  if (!Array.isArray(devices)) {
    throw new Error('Backend snapshot has an invalid shape')
  }

  return {
    devices,
    usage: extractUsage(usagePayload),
    alerts: Array.isArray(alerts) ? alerts : null,
  }
}
