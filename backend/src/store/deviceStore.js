import { createInitialDevices, ROOM_NAMES } from '../data/initialDevices.js'
import { calculateRoomSummary, calculateTotalPowerW } from '../utils/power.js'

// The only mutable device collection in the backend. Every future API,
// simulator, socket event, and alert engine must access state through this module.
const devices = createInitialDevices()

const cloneDevice = (device) => ({ ...device })

export const getAllDevices = () => devices.map(cloneDevice)

export const getDevicesByRoom = (roomName) =>
  devices.filter((device) => device.room === roomName).map(cloneDevice)

export const getDeviceById = (id) => {
  const device = devices.find((candidate) => candidate.id === id)
  return device ? cloneDevice(device) : null
}

export function updateDeviceStatus(id, status) {
  const normalizedStatus = String(status).toUpperCase()
  if (!['ON', 'OFF'].includes(normalizedStatus)) {
    throw new TypeError('Device status must be ON or OFF')
  }

  const device = devices.find((candidate) => candidate.id === id)
  if (!device) return null
  if (device.status === normalizedStatus) return cloneDevice(device)

  const changedAt = new Date().toISOString()
  const currentPower = normalizedStatus === 'ON' ? device.ratedPowerW : 0

  device.status = normalizedStatus
  device.currentPowerW = currentPower
  device.currentPower = currentPower
  device.lastChanged = changedAt
  device.onSince = normalizedStatus === 'ON' ? changedAt : null

  return cloneDevice(device)
}

export const getRoomSummary = () => calculateRoomSummary(devices, ROOM_NAMES)

export const getUsageSummary = () => {
  const totalPowerW = calculateTotalPowerW(devices)

  return {
    totalPowerW,
    totalPower: totalPowerW,
    rooms: getRoomSummary(),
    updatedAt: new Date().toISOString(),
  }
}
