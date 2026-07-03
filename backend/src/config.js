import 'dotenv/config'

const toInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const config = Object.freeze({
  port: toInteger(process.env.PORT, 5000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  officeStartHour: toInteger(process.env.OFFICE_START_HOUR, 9),
  officeEndHour: toInteger(process.env.OFFICE_END_HOUR, 17),
  simulatorIntervalMs: toInteger(process.env.SIMULATOR_INTERVAL_MS, 7000),
  deviceOnTimeoutMinutes: toInteger(process.env.DEVICE_ON_TIMEOUT_MINUTES, 120),
  roomFullyOnTimeoutMinutes: toInteger(process.env.ROOM_FULLY_ON_TIMEOUT_MINUTES, 120),
  highPowerThresholdW: toInteger(process.env.HIGH_POWER_THRESHOLD_W, 250),
  get deviceOnTimeoutMs() {
    return this.deviceOnTimeoutMinutes * 60_000
  },
  get roomFullyOnTimeoutMs() {
    return this.roomFullyOnTimeoutMinutes * 60_000
  },
})
