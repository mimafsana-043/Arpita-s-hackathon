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
import {
  getDeviceById,
  getUsageSummary,
  updateDeviceStatus,
} from '../store/deviceStore.js'
import { getActiveAlerts } from '../services/alertService.js'
import { emitLiveUpdate } from '../realtime/socket.js'

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
  const devices = createDevicesSnapshot()
  const usage = getUsageSummary()
  response.json(getActiveAlerts(devices, usage, new Date()))
})

apiRouter.get('/api/status', (_request, response) => {
  response.json(createStatusSnapshot())
})

const deviceNotFound = (response, id) => response.status(404).json({
  status: 'NOT_FOUND',
  code: 'UNKNOWN_DEVICE',
  message: `No device found with id "${id}".`,
})

const createMutationResponse = (device) => {
  const liveSnapshot = emitLiveUpdate({ changedDevices: [device] })
  return {
    device,
    usage: liveSnapshot.usage,
    alerts: liveSnapshot.alerts,
    updatedAt: liveSnapshot.usage.updatedAt,
  }
}

apiRouter.post('/api/devices/:id/toggle', (request, response) => {
  const existingDevice = getDeviceById(request.params.id)
  if (!existingDevice) return deviceNotFound(response, request.params.id)

  const device = updateDeviceStatus(
    existingDevice.id,
    existingDevice.status === 'ON' ? 'OFF' : 'ON',
  )
  return response.json(createMutationResponse(device))
})

apiRouter.post('/api/devices/:id/status', (request, response) => {
  const status = String(request.body?.status ?? '').toUpperCase()
  if (!['ON', 'OFF'].includes(status)) {
    return response.status(400).json({
      status: 'BAD_REQUEST',
      code: 'INVALID_STATUS',
      message: 'Request body status must be ON or OFF.',
    })
  }

  if (!getDeviceById(request.params.id)) {
    return deviceNotFound(response, request.params.id)
  }

  const device = updateDeviceStatus(request.params.id, status)
  return response.json(createMutationResponse(device))
})
