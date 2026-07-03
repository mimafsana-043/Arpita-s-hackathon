import assert from 'node:assert/strict'
import { ROOM_NAMES } from '../data/initialDevices.js'
import {
  getAllDevices,
  getRoomSummary,
  getUsageSummary,
  updateDeviceStatus,
} from '../store/deviceStore.js'
import { getCurrentPowerW } from '../utils/power.js'
import {
  deduplicateAlerts,
  detectAfterHoursDevices,
  detectContinuousOnDevices,
  detectHighPowerUsage,
  detectRoomFullyOnTooLong,
} from '../services/alertService.js'

getAllDevices().forEach((device) => updateDeviceStatus(device.id, 'OFF'))

assert.equal(getAllDevices().length, 18, 'Device count must be exactly 18')
assert.equal(ROOM_NAMES.length, 3, 'Exactly three room names must exist')
assert.equal(Object.keys(getRoomSummary()).length, 3, 'Usage must contain three rooms')

const beforeToggle = getAllDevices().find((device) => device.id === 'drawing_room_fan_1')
const toggled = updateDeviceStatus(beforeToggle.id, 'ON')
assert.equal(toggled.status, 'ON', 'Manual store update must turn the device ON')
assert.equal(toggled.currentPowerW, toggled.ratedPowerW)

const devices = getAllDevices()
const usage = getUsageSummary()
const summedPowerW = devices.reduce((total, device) => total + getCurrentPowerW(device), 0)
assert.equal(usage.totalPowerW, summedPowerW, 'Usage total must match active-device power sum')
assert.equal(usage.totalPower, usage.totalPowerW, 'Usage aliases must remain synchronized')

const afterHoursNow = new Date(2026, 0, 1, 20, 0, 0)
const afterHoursAlerts = detectAfterHoursDevices(devices, afterHoursNow, {
  officeStartHour: 9,
  officeEndHour: 17,
})
assert.ok(afterHoursAlerts.some((alert) => alert.type === 'after_hours_on'))

const timeoutNow = new Date('2026-07-03T15:00:00.000Z')
const longRunningDevice = {
  ...toggled,
  onSince: new Date(timeoutNow.getTime() - 121 * 60_000).toISOString(),
}
assert.equal(
  detectContinuousOnDevices([longRunningDevice], timeoutNow, 120 * 60_000).length,
  1,
  'Continuous runtime rule must trigger after its threshold',
)

const fullyOnSince = new Date(timeoutNow.getTime() - 121 * 60_000).toISOString()
const fullyActiveRoom = devices
  .filter((device) => device.room === 'Drawing Room')
  .map((device) => ({ ...device, status: 'ON', onSince: fullyOnSince }))
assert.equal(
  detectRoomFullyOnTooLong(fullyActiveRoom, timeoutNow, 120 * 60_000).length,
  1,
  'Fully active room rule must trigger after its threshold',
)

assert.equal(
  detectHighPowerUsage({ totalPowerW: 251 }, 250, timeoutNow).length,
  1,
  'High power rule must trigger at the configured threshold',
)

const duplicate = afterHoursAlerts[0]
assert.equal(deduplicateAlerts([duplicate, duplicate]).length, 1, 'Duplicate alerts must collapse')

updateDeviceStatus(toggled.id, 'OFF')
assert.equal(getAllDevices().find((device) => device.id === toggled.id).status, 'OFF')

console.log('Backend validation passed: inventory, rooms, usage, mutations, alert rules, and deduplication are valid.')
