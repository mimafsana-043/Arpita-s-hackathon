import { io } from 'socket.io-client'
import { BACKEND_URL } from './api.js'

export const createDashboardSocket = () =>
  io(BACKEND_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    autoConnect: false,
  })
