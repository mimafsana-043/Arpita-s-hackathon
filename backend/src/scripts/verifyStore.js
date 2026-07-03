import assert from 'node:assert/strict'
import { ROOM_NAMES } from '../data/initialDevices.js'
import {
  getAllDevices,
  getDevicesByRoom,
  getUsageSummary,
  updateDeviceStatus,
} from '../store/deviceStore.js'

const devices = getAllDevices()

assert.equal(devices.length, 18, 'Store must contain exactly 18 devices')
assert.equal(new Set(devices.map((device) => device.id)).size, 18, 'Device IDs must be unique')

ROOM_NAMES.forEach((room) => {
  const roomDevices = getDevicesByRoom(room)
  assert.equal(roomDevices.length, 6, `${room} must contain six devices`)
  assert.equal(roomDevices.filter((device) => device.type === 'fan').length, 2)
  assert.equal(roomDevices.filter((device) => device.type === 'light').length, 4)
})

assert.equal(getUsageSummary().totalPowerW, 0, 'Initial usage must be zero')

const enabledFan = updateDeviceStatus('drawing_room_fan_1', 'ON')
assert.equal(enabledFan.currentPowerW, 60)
assert.equal(enabledFan.currentPower, 60)
assert.ok(enabledFan.onSince)
assert.equal(getUsageSummary().totalPowerW, 60)

const disabledFan = updateDeviceStatus('drawing_room_fan_1', 'OFF')
assert.equal(disabledFan.currentPowerW, 0)
assert.equal(disabledFan.onSince, null)
assert.equal(getUsageSummary().totalPowerW, 0)

console.log('Store verification passed: 18 unique devices, room counts, and power transitions are valid.')
