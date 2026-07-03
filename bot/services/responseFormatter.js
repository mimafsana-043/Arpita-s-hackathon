import { getDevicePower, getRoomPower, getTotalPower, isDeviceOn } from './powerUtils.js'
import { ROOM_ORDER } from './rooms.js'

const countOnByType = (devices, type) =>
  devices.filter((device) => device.type === type && isDeviceOn(device.status)).length

export function buildStatusText(devices) {
  const perRoom = ROOM_ORDER.map((room) => {
    const roomDevices = devices.filter((device) => device.room === room)
    const fansOn = countOnByType(roomDevices, 'fan')
    const lightsOn = countOnByType(roomDevices, 'light')

    if (fansOn === 0 && lightsOn === 0) return `${room}: all off.`

    const bits = []
    if (fansOn > 0) bits.push(`${fansOn} fan${fansOn === 1 ? '' : 's'} ON`)
    if (lightsOn > 0) bits.push(`${lightsOn} light${lightsOn === 1 ? '' : 's'} ON`)
    return `${room}: ${bits.join(', ')}.`
  })

  return perRoom.join(' ')
}

export function buildRoomSummary(roomName, devices, usage) {
  const roomPower = getRoomPower(usage, roomName, devices)
  return `${roomName} is drawing ${roomPower}W right now.`
}

// Kept separate from buildRoomSummary (and never passed through the LLM) so
// per-device ON/OFF facts can never be paraphrased away or misstated.
export function buildRoomDeviceLines(roomName, devices) {
  return devices
    .filter((device) => device.room === roomName)
    .map((device) => `${device.name}: ${isDeviceOn(device.status) ? 'ON' : 'OFF'} (${getDevicePower(device)}W)`)
}

export function buildUsageText(usage, devices) {
  const total = getTotalPower(usage, devices)
  const sentences = [`Total power right now: ${total}W.`]

  const roomTotals = ROOM_ORDER
    .map((room) => ({ room, power: getRoomPower(usage, room, devices) }))
    .filter((entry) => entry.power > 0)
    .sort((a, b) => b.power - a.power)

  if (roomTotals.length === 1) {
    sentences.push(`${roomTotals[0].room} is drawing the most at ${roomTotals[0].power}W.`)
  } else if (roomTotals.length > 1) {
    const [top, second] = roomTotals
    sentences.push(`${top.room} (${top.power}W) and ${second.room} (${second.power}W) are drawing the most.`)
  }

  const estimatedTodayKWh = usage?.estimatedTodayKWh ?? usage?.estimatedKWh
  if (Number.isFinite(Number(estimatedTodayKWh))) {
    sentences.push(`Today's estimated usage: ${Number(estimatedTodayKWh).toFixed(1)} kWh.`)
  }

  return sentences.join(' ')
}

// The backend's alert messages already read as complete, friendly sentences
// (with their own emoji and room name baked in) — post them as-is rather than
// wrapping them in another layer of "Heads up" text. Only add a plain-text
// fallback for alert sources that send bare facts with no message string.
export function buildAlertText(alert) {
  if (alert.message) return alert.message

  const when = alert.timestamp
    ? new Date(alert.timestamp).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : null
  const roomPart = alert.room ? ` in ${alert.room}` : ''
  const whenPart = when ? ` (as of ${when})` : ''
  return `⚠️ Heads up — something needs attention${roomPart}${whenPart}.`
}
