import { Server } from 'socket.io'
import { config } from '../config.js'
import { getAllDevices, getUsageSummary } from '../store/deviceStore.js'
import { getActiveAlerts } from '../services/alertService.js'

let io = null

const createLiveSnapshot = () => {
  const devices = getAllDevices()
  const usage = getUsageSummary()

  return {
    devices,
    usage,
    alerts: getActiveAlerts(devices, usage, new Date()),
  }
}

export function initializeSocket(httpServer) {
  if (io) return io

  io = new Server(httpServer, {
    cors: {
      origin: config.frontendOrigin,
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`)
    const snapshot = createLiveSnapshot()
    socket.emit('devices:update', snapshot.devices)
    socket.emit('usage:update', snapshot.usage)
    socket.emit('alerts:update', snapshot.alerts)

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`)
    })
  })

  return io
}

export function emitLiveUpdate({
  changedDevices = [],
  phase = null,
  emitTick = false,
  timestamp = new Date().toISOString(),
} = {}) {
  const snapshot = createLiveSnapshot()

  if (io) {
    changedDevices.forEach((device) => io.emit('device:update', device))
    io.emit('devices:update', snapshot.devices)
    io.emit('usage:update', snapshot.usage)
    io.emit('alerts:update', snapshot.alerts)

    if (emitTick) {
      io.emit('simulator:tick', {
        timestamp,
        changedCount: changedDevices.length,
        phase,
        totalPowerW: snapshot.usage.totalPowerW,
      })
    }
  }

  return snapshot
}

export function closeSocket() {
  if (!io) return
  io.close()
  io = null
}
