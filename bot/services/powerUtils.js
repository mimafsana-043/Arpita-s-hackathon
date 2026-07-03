// Mirrors frontend/src/utils/power.js so the bot's numbers always agree with
// the dashboard's numbers. If that file changes, update this one to match.

export const isDeviceOn = (status) =>
  typeof status === 'string' && status.toLowerCase() === 'on'

export const getDevicePower = (device) =>
  isDeviceOn(device.status) ? Number(device.currentPower ?? device.power ?? 0) : 0

export const calculateTotalPower = (devices) =>
  devices.reduce((total, device) => total + getDevicePower(device), 0)

export const calculateRoomPower = (devices) =>
  devices.reduce((rooms, device) => {
    rooms[device.room] = (rooms[device.room] ?? 0) + getDevicePower(device)
    return rooms
  }, {})

const firstFiniteNumber = (...values) => {
  const match = values.find((value) => Number.isFinite(Number(value)))
  return match === undefined ? null : Number(match)
}

export const getTotalPower = (usage, devices) =>
  firstFiniteNumber(
    usage?.totalPower,
    usage?.currentPower,
    usage?.total,
    usage?.power,
  ) ?? calculateTotalPower(devices)

export const getRoomPower = (usage, room, devices) => {
  const roomUsage = usage?.roomPower?.[room]
    ?? usage?.perRoom?.[room]
    ?? usage?.rooms?.[room]

  const backendValue = typeof roomUsage === 'object'
    ? firstFiniteNumber(roomUsage?.currentPower, roomUsage?.power, roomUsage?.totalPower)
    : firstFiniteNumber(roomUsage)

  if (backendValue !== null) return backendValue

  return calculateTotalPower(devices.filter((device) => device.room === room))
}
