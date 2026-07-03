import { io } from 'socket.io-client'
import { extractAlerts } from './apiClient.js'

const BACKEND_SOCKET_URL = process.env.BACKEND_SOCKET_URL || process.env.BACKEND_API_URL || 'http://localhost:5000'

// Bonus real-time path: if the backend's Socket.IO server is reachable, alerts
// reach the bot instantly. If not (backend not built yet, or momentarily
// down), the interval poll in discordBot.js is what keeps alerts flowing —
// this socket is best-effort only, never required.
export function createAlertSocket(onAlertsUpdate) {
  const socket = io(BACKEND_SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
  })

  socket.on('connect', () => {
    console.log(`[socket] connected to ${BACKEND_SOCKET_URL}`)
  })

  socket.on('disconnect', () => {
    console.log('[socket] disconnected, falling back to alert polling only')
  })

  socket.on('connect_error', (error) => {
    console.log(`[socket] connect_error (${error.message}); relying on alert polling`)
  })

  socket.on('alerts:update', (payload) => {
    const alerts = extractAlerts(payload)
    if (Array.isArray(alerts)) onAlertsUpdate(alerts)
  })

  return socket
}
