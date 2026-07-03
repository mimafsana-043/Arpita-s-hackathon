export const ROOM_ORDER = ['Drawing Room', 'Work Room 1', 'Work Room 2']

export const ROOM_ALIASES = {
  drawing: 'Drawing Room',
  drawingroom: 'Drawing Room',
  work1: 'Work Room 1',
  workroom1: 'Work Room 1',
  work2: 'Work Room 2',
  workroom2: 'Work Room 2',
}

export function resolveRoomName(input) {
  if (!input) return null
  const key = input.trim().toLowerCase().replace(/[\s_-]+/g, '')
  return ROOM_ALIASES[key] ?? null
}
