import { calculateCapacity, isDeviceOn } from './power.js'

export const HIGH_POWER_THRESHOLD = 350
export const OFFICE_START_HOUR = 8
export const OFFICE_END_HOUR = 18

export function deriveAlerts(devices, totalPower, date = new Date()) {
  const alerts = []
  const timestamp = date.toISOString()
  const activeDevices = devices.filter((device) => isDeviceOn(device.status))
  const hour = date.getHours()
  const afterHours = hour < OFFICE_START_HOUR || hour >= OFFICE_END_HOUR

  if (afterHours && activeDevices.length > 0) {
    alerts.push({
      id: 'local-after-hours',
      severity: 'medium',
      message: `${activeDevices.length} device${activeDevices.length === 1 ? '' : 's'} still running after office hours`,
      timestamp,
      category: 'Schedule',
      reason: 'Office hours are 8:00 AM–6:00 PM',
      source: 'local',
    })
  }

  const roomNames = [...new Set(devices.map((device) => device.room))]
  roomNames.forEach((room) => {
    const roomDevices = devices.filter((device) => device.room === room)
    if (roomDevices.length === 5 && roomDevices.every((device) => isDeviceOn(device.status))) {
      alerts.push({
        id: `local-fully-active-${room.toLowerCase().replaceAll(' ', '-')}`,
        severity: 'high',
        message: 'Every device in this room is switched on',
        room,
        timestamp,
        category: 'Room load',
        reason: 'All 5 devices are active',
        source: 'local',
      })
    }
  })

  const capacity = calculateCapacity(devices)
  if (totalPower >= HIGH_POWER_THRESHOLD) {
    alerts.push({
      id: 'local-high-power',
      severity: 'high',
      message: 'Office power consumption is unusually high',
      timestamp,
      category: 'Energy usage',
      reason: `${totalPower}W of ${capacity}W capacity is currently in use`,
      source: 'local',
    })
  }

  return alerts
}
