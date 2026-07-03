import { Router } from 'express'
import { ROOM_NAMES } from '../data/initialDevices.js'
import {
  createDevicesSnapshot,
  createRoomsSnapshot,
  createRoomSnapshot,
  createStatusSnapshot,
  createUsageSnapshot,
} from '../services/snapshotService.js'
import { resolveRoomName, ROOM_ALIASES } from '../utils/rooms.js'

export const apiRouter = Router()

apiRouter.get(['/api/devices', '/devices'], (_request, response) => {
  response.json(createDevicesSnapshot())
})

apiRouter.get(['/api/rooms', '/rooms'], (_request, response) => {
  response.json(createRoomsSnapshot())
})

apiRouter.get(['/api/rooms/:roomName', '/room/:roomName'], (request, response) => {
  const roomName = resolveRoomName(request.params.roomName)

  if (!roomName) {
    return response.status(404).json({
      status: 'NOT_FOUND',
      code: 'UNKNOWN_ROOM',
      message: `Unknown room "${request.params.roomName}". Use a room name or supported alias.`,
      availableRooms: ROOM_NAMES,
      aliases: Object.keys(ROOM_ALIASES).filter((alias) => !alias.includes(' ')),
    })
  }

  return response.json(createRoomSnapshot(roomName))
})

apiRouter.get(['/api/usage', '/usage'], (_request, response) => {
  response.json(createUsageSnapshot())
})

apiRouter.get(['/api/alerts', '/alerts'], (_request, response) => {
  response.json([])
})

apiRouter.get('/api/status', (_request, response) => {
  response.json(createStatusSnapshot())
})
