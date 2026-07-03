import { ROOM_NAMES } from '../data/initialDevices.js'

export const ROOM_ALIASES = Object.freeze({
  drawing: 'Drawing Room',
  'drawing-room': 'Drawing Room',
  'drawing room': 'Drawing Room',
  work1: 'Work Room 1',
  'work-room-1': 'Work Room 1',
  'work room 1': 'Work Room 1',
  work2: 'Work Room 2',
  'work-room-2': 'Work Room 2',
  'work room 2': 'Work Room 2',
})

export function resolveRoomName(value) {
  const normalized = String(value ?? '').trim().toLowerCase().replaceAll('_', '-')
  return ROOM_ALIASES[normalized]
    ?? ROOM_NAMES.find((room) => room.toLowerCase() === normalized)
    ?? null
}
