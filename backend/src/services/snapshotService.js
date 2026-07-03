import { ROOM_NAMES } from '../data/initialDevices.js'
import {
  getAllDevices,
  getDevicesByRoom,
  getRoomSummary,
  getUsageSummary,
} from '../store/deviceStore.js'

const round = (value, precision = 4) => {
  const factor = 10 ** precision
  return Math.round(value * factor) / factor
}

export function estimateTodayKWh(totalPowerW, date = new Date()) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const elapsedHours = Math.max(0, (date.getTime() - startOfDay.getTime()) / 3_600_000)

  // Step 2 has no persisted usage samples yet. Treat the current load as if it
  // had been constant since local midnight; a later accumulator can replace it.
  return round((totalPowerW * elapsedHours) / 1000)
}

export const createDevicesSnapshot = () => getAllDevices()

export function createRoomsSnapshot() {
  const summaries = getRoomSummary()
  const updatedAt = new Date().toISOString()

  return ROOM_NAMES.map((name) => ({
    name,
    summary: summaries[name],
    devices: getDevicesByRoom(name),
    updatedAt,
  }))
}

export function createRoomSnapshot(roomName) {
  const summaries = getRoomSummary()

  return {
    name: roomName,
    summary: summaries[roomName],
    devices: getDevicesByRoom(roomName),
    updatedAt: new Date().toISOString(),
  }
}

export function createUsageSnapshot(date = new Date()) {
  const usage = getUsageSummary()

  return {
    ...usage,
    estimatedTodayKWh: estimateTodayKWh(usage.totalPowerW, date),
  }
}

const activeLabel = (count, singular, plural) =>
  `${count} ${count === 1 ? singular : plural} ON`

export function createStatusSnapshot() {
  const usage = createUsageSnapshot()
  const rooms = ROOM_NAMES.map((name) => {
    const summary = usage.rooms[name]
    const activeParts = [
      summary.activeFans > 0 && activeLabel(summary.activeFans, 'fan', 'fans'),
      summary.activeLights > 0 && activeLabel(summary.activeLights, 'light', 'lights'),
    ].filter(Boolean)
    const message = activeParts.length === 0
      ? `${name}: all off`
      : `${name}: ${activeParts.join(', ')}`

    return { name, message, ...summary }
  })

  return {
    message: `${rooms.map((room) => room.message).join('. ')}.`,
    rooms,
    usage,
    updatedAt: usage.updatedAt,
  }
}
