import assert from 'node:assert/strict'
import {
  applySimulatorTick,
  getOfficePhase,
  getTargetOnProbability,
  simulateForgottenRoomScenario,
} from '../simulator/simulator.js'
import { getAllDevices, updateDeviceStatus } from '../store/deviceStore.js'

assert.equal(getOfficePhase(new Date(2026, 0, 1, 8)), 'before-hours')
assert.equal(getOfficePhase(new Date(2026, 0, 1, 9)), 'morning-start')
assert.equal(getOfficePhase(new Date(2026, 0, 1, 12)), 'midday')
assert.equal(getOfficePhase(new Date(2026, 0, 1, 18)), 'closing-time')
assert.equal(getOfficePhase(new Date(2026, 0, 1, 21)), 'night')

const drawingFan = getAllDevices().find((device) => device.id === 'drawing_room_fan_1')
const workFan = getAllDevices().find((device) => device.id === 'work_room_1_fan_1')
assert.ok(
  getTargetOnProbability(workFan, 'morning-start')
    > getTargetOnProbability(drawingFan, 'morning-start'),
  'Work rooms should become active before the Drawing Room',
)

const morningTick = applySimulatorTick({
  date: new Date(2026, 0, 1, 9, 30),
  random: () => 0,
})
assert.ok(morningTick.changedDevices.length <= 3, 'A tick must change at most three devices')
assert.ok(morningTick.changedDevices.length > 0, 'Morning deterministic tick should activate devices')

getAllDevices().forEach((device) => updateDeviceStatus(device.id, 'OFF'))
const forgotten = simulateForgottenRoomScenario({
  phase: 'night',
  random: () => 0,
  maxChanges: 2,
})
assert.equal(forgotten.length, 1, 'Forgotten-room scenario should leave a small partial load')
assert.equal(forgotten[0].status, 'ON')

console.log('Simulator verification passed: phases, room bias, tick cap, and forgotten-room behavior are valid.')
