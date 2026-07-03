import { config as appConfig } from '../config.js'
import { getAllDevices, getUsageSummary } from '../store/deviceStore.js'
import { isDeviceOn } from '../utils/power.js'

const toDate = (value) => value instanceof Date ? value : new Date(value)
const toIso = (value) => toDate(value).toISOString()
const slug = (value) => String(value || 'office').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const pluralize = (count, singular, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`

const groupByRoom = (devices) => devices.reduce((rooms, device) => {
  rooms[device.room] = [...(rooms[device.room] ?? []), device]
  return rooms
}, {})

export function normalizeAlert(alert, now = new Date()) {
  const deviceIds = [...new Set(alert.deviceIds ?? [])].sort()
  const type = alert.type || 'unknown'
  const room = alert.room ?? null
  const createdAt = alert.createdAt ? toIso(alert.createdAt) : toIso(now)
  const severity = ['high', 'medium', 'low'].includes(alert.severity)
    ? alert.severity
    : 'medium'

  return {
    id: alert.id || `${slug(type)}-${slug(room)}-${deviceIds.map(slug).join('-') || 'all'}`,
    severity,
    type,
    room,
    message: alert.message || 'Office energy alert',
    createdAt,
    timestamp: createdAt,
    deviceIds,
    category: alert.category ?? 'Energy monitoring',
    ...(alert.reason ? { reason: alert.reason } : {}),
  }
}

export function deduplicateAlerts(alerts) {
  const uniqueAlerts = new Map()

  alerts.forEach((alert) => {
    const normalized = normalizeAlert(alert)
    const key = [
      normalized.type,
      normalized.room ?? 'office',
      normalized.deviceIds.join(','),
    ].join('|')

    if (!uniqueAlerts.has(key)) uniqueAlerts.set(key, normalized)
  })

  return [...uniqueAlerts.values()]
}

export function detectAfterHoursDevices(devices, now = new Date(), config = appConfig) {
  const currentTime = toDate(now)
  const hour = currentTime.getHours()
  const outsideOfficeHours = hour < config.officeStartHour || hour >= config.officeEndHour
  if (!outsideOfficeHours) return []

  return Object.entries(groupByRoom(devices.filter(isDeviceOn))).map(([room, activeDevices]) => {
    const fanCount = activeDevices.filter((device) => device.type === 'fan').length
    const lightCount = activeDevices.filter((device) => device.type === 'light').length
    const activeParts = [
      fanCount > 0 && pluralize(fanCount, 'fan'),
      lightCount > 0 && pluralize(lightCount, 'light'),
    ].filter(Boolean)

    return normalizeAlert({
      severity: activeDevices.length >= 3 ? 'high' : 'medium',
      type: 'after_hours_on',
      room,
      message: `⚠️ ${room} still has ${activeParts.join(' and ')} ON after office hours. Someone may have forgotten to switch them off.`,
      createdAt: currentTime,
      deviceIds: activeDevices.map((device) => device.id),
      category: 'Schedule',
      reason: `Office hours are ${config.officeStartHour}:00–${config.officeEndHour}:00`,
    }, currentTime)
  })
}

export function detectContinuousOnDevices(devices, now = new Date(), thresholdMs) {
  const currentTime = toDate(now)
  const timeoutMs = thresholdMs ?? appConfig.deviceOnTimeoutMs

  return devices.flatMap((device) => {
    if (!isDeviceOn(device) || !device.onSince) return []
    const onSince = toDate(device.onSince)
    const durationMs = currentTime.getTime() - onSince.getTime()
    if (!Number.isFinite(durationMs) || durationMs < timeoutMs) return []

    const durationMinutes = Math.floor(durationMs / 60_000)
    return [normalizeAlert({
      severity: durationMs >= timeoutMs * 2 ? 'high' : 'medium',
      type: 'continuous_on',
      room: device.room,
      message: `⏱️ ${device.name} in ${device.room} has been ON continuously for ${durationMinutes} minutes.`,
      createdAt: new Date(onSince.getTime() + timeoutMs),
      deviceIds: [device.id],
      category: 'Runtime',
      reason: `Continuous ON limit is ${Math.round(timeoutMs / 60_000)} minutes`,
    }, currentTime)]
  })
}

export function detectRoomFullyOnTooLong(devices, now = new Date(), thresholdMs) {
  const currentTime = toDate(now)
  const timeoutMs = thresholdMs ?? appConfig.roomFullyOnTimeoutMs

  return Object.entries(groupByRoom(devices)).flatMap(([room, roomDevices]) => {
    if (roomDevices.length === 0 || !roomDevices.every((device) => isDeviceOn(device) && device.onSince)) {
      return []
    }

    const fullyActiveSinceMs = Math.max(...roomDevices.map((device) => toDate(device.onSince).getTime()))
    const durationMs = currentTime.getTime() - fullyActiveSinceMs
    if (!Number.isFinite(durationMs) || durationMs < timeoutMs) return []

    const fanCount = roomDevices.filter((device) => device.type === 'fan').length
    const lightCount = roomDevices.filter((device) => device.type === 'light').length
    return [normalizeAlert({
      severity: 'high',
      type: 'room_fully_on_timeout',
      room,
      message: `🚨 ${room} has all ${pluralize(fanCount, 'fan')} and ${pluralize(lightCount, 'light')} ON for over ${Math.round(durationMs / 60_000)} minutes.`,
      createdAt: new Date(fullyActiveSinceMs + timeoutMs),
      deviceIds: roomDevices.map((device) => device.id),
      category: 'Room load',
      reason: `The entire room exceeded the ${Math.round(timeoutMs / 60_000)} minute limit`,
    }, currentTime)]
  })
}

export function detectHighPowerUsage(usage, thresholdW = appConfig.highPowerThresholdW, now = new Date()) {
  const totalPowerW = Number(usage?.totalPowerW ?? usage?.totalPower ?? 0)
  if (totalPowerW < thresholdW) return []

  return [normalizeAlert({
    severity: totalPowerW >= thresholdW * 1.5 ? 'high' : 'medium',
    type: 'high_power_usage',
    message: `⚡ Office power usage is ${totalPowerW}W, above the ${thresholdW}W alert threshold.`,
    createdAt: now,
    deviceIds: [],
    category: 'Energy usage',
    reason: 'Combined active-device load is above the configured limit',
  }, now)]
}

export function getActiveAlerts(
  devices = getAllDevices(),
  usage = getUsageSummary(),
  now = new Date(),
) {
  return deduplicateAlerts([
    ...detectAfterHoursDevices(devices, now, appConfig),
    ...detectContinuousOnDevices(devices, now, appConfig.deviceOnTimeoutMs),
    ...detectRoomFullyOnTooLong(devices, now, appConfig.roomFullyOnTimeoutMs),
    ...detectHighPowerUsage(usage, appConfig.highPowerThresholdW, now),
  ])
}
