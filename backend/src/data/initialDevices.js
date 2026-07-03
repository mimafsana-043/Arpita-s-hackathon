export const ROOM_NAMES = Object.freeze([
  'Drawing Room',
  'Work Room 1',
  'Work Room 2',
])

const DEVICE_DEFINITIONS = Object.freeze([
  { name: 'Fan 1', type: 'fan', ratedPowerW: 60 },
  { name: 'Fan 2', type: 'fan', ratedPowerW: 60 },
  { name: 'Light 1', type: 'light', ratedPowerW: 15 },
  { name: 'Light 2', type: 'light', ratedPowerW: 15 },
  { name: 'Light 3', type: 'light', ratedPowerW: 15 },
  { name: 'Light 4', type: 'light', ratedPowerW: 15 },
])

const roomId = (room) => room.toLowerCase().replaceAll(' ', '_')
const deviceId = (device) => device.name.toLowerCase().replaceAll(' ', '_')

export function createInitialDevices(timestamp = new Date().toISOString()) {
  return ROOM_NAMES.flatMap((room) =>
    DEVICE_DEFINITIONS.map((definition) => ({
      id: `${roomId(room)}_${deviceId(definition)}`,
      name: definition.name,
      room,
      type: definition.type,
      status: 'OFF',
      ratedPowerW: definition.ratedPowerW,
      power: definition.ratedPowerW,
      currentPowerW: 0,
      currentPower: 0,
      lastChanged: timestamp,
      onSince: null,
    })),
  )
}
