import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import { getAllDevices } from './store/deviceStore.js'

const app = express()

app.disable('x-powered-by')
app.use(cors({ origin: config.frontendOrigin }))
app.use(express.json())

app.get('/health', (_request, response) => {
  response.status(200).json({
    status: 'OK',
    service: 'smart-office-energy-backend',
    deviceCount: getAllDevices().length,
    timestamp: new Date().toISOString(),
  })
})

app.use((_request, response) => {
  response.status(404).json({ status: 'NOT_FOUND', message: 'Route not found' })
})

const server = app.listen(config.port, () => {
  console.log(`Smart Office backend listening on http://localhost:${config.port}`)
})

function shutdown(signal) {
  console.log(`${signal} received. Closing HTTP server.`)
  server.close(() => process.exit(0))
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

export { app, server }
