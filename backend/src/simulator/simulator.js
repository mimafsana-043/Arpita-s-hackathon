import { config } from '../config.js'
import { ROOM_NAMES } from '../data/initialDevices.js'
import {
  getAllDevices,
  getDevicesByRoom,
  updateDeviceStatus,
} from '../store/deviceStore.js'
import { isDeviceOn } from '../utils/power.js'

const PHASE_CHANGE_RATES = Object.freeze({
  'before-hours': 0.12,
  'morning-start': 0.28,
  midday: 0.035,
  'closing-time': 0.3,
  night: 0.16,
})

let simulatorTimer = null

export function getOfficePhase(date = new Date()) {
  const hour = date.getHours()
  if (hour < config.officeStartHour) return 'before-hours'
  if (hour < 11) return 'morning-start'
  if (hour < config.officeEndHour) return 'midday'
  if (hour < 19) return 'closing-time'
  return 'night'
}

export function getTargetOnProbability(device, phase) {
  const isWorkRoom = device.room.startsWith('Work Room')
  const isFan = device.type === 'fan'

  const probabilities = {
    'before-hours': isFan ? 0.015 : 0.035,
    'morning-start': isWorkRoom
      ? (isFan ? 0.72 : 0.82)
      : (isFan ? 0.35 : 0.48),
    midday: isWorkRoom
      ? (isFan ? 0.82 : 0.9)
      : (isFan ? 0.58 : 0.66),
    'closing-time': isWorkRoom
      ? (isFan ? 0.22 : 0.3)
      : (isFan ? 0.12 : 0.2),
    night: isFan ? 0.01 : 0.02,
  }

  return probabilities[phase] ?? 0
}

export function shouldToggleDevice(device, phase, random = Math.random) {
  const targetProbability = getTargetOnProbability(device, phase)
  const phaseRate = PHASE_CHANGE_RATES[phase] ?? 0.05
  const distanceFromTarget = isDeviceOn(device)
    ? 1 - targetProbability
    : targetProbability

  return random() < distanceFromTarget * phaseRate
}

const shuffled = (items, random) => {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

export function simulateForgottenRoomScenario({
  phase,
  random = Math.random,
  maxChanges = 2,
  excludedIds = new Set(),
} = {}) {
  if (phase !== 'night' || maxChanges <= 0 || random() >= 0.12) return []
  if (getAllDevices().some(isDeviceOn)) return []

  const room = ROOM_NAMES[Math.floor(random() * ROOM_NAMES.length)]
  const candidates = getDevicesByRoom(room).filter((device) =>
    !isDeviceOn(device) && !excludedIds.has(device.id),
  )
  const numberToLeaveOn = Math.min(maxChanges, random() < 0.7 ? 1 : 2)

  return shuffled(candidates, random)
    .slice(0, numberToLeaveOn)
    .map((device) => updateDeviceStatus(device.id, 'ON'))
    .filter(Boolean)
}

export function applySimulatorTick({ date = new Date(), random = Math.random } = {}) {
  const phase = getOfficePhase(date)
  const candidates = getAllDevices().filter((device) =>
    shouldToggleDevice(device, phase, random),
  )
  const changedDevices = shuffled(candidates, random)
    .slice(0, 3)
    .map((device) => updateDeviceStatus(device.id, isDeviceOn(device) ? 'OFF' : 'ON'))
    .filter(Boolean)

  const forgottenDevices = simulateForgottenRoomScenario({
    phase,
    random,
    maxChanges: 3 - changedDevices.length,
    excludedIds: new Set(changedDevices.map((device) => device.id)),
  })

  return {
    phase,
    changedDevices: [...changedDevices, ...forgottenDevices],
    timestamp: date.toISOString(),
  }
}

export function startSimulator({ onTick } = {}) {
  if (simulatorTimer) return simulatorTimer

  simulatorTimer = setInterval(() => {
    const result = applySimulatorTick()
    onTick?.(result)
  }, config.simulatorIntervalMs)

  console.log(`Simulator started with ${config.simulatorIntervalMs}ms interval`)
  return simulatorTimer
}

export function stopSimulator() {
  if (!simulatorTimer) return
  clearInterval(simulatorTimer)
  simulatorTimer = null
}
