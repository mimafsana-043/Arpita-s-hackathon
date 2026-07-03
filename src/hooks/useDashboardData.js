import { useEffect, useRef, useState } from 'react'
import { mockDevices, mockLastUpdated } from '../data/mockDevices.js'
import {
  extractAlerts,
  extractDevices,
  extractUsage,
  fetchDashboardSnapshot,
} from '../services/api.js'
import { createDashboardSocket } from '../services/socket.js'
import { getTotalPower } from '../utils/power.js'
import { appendPowerPoint } from '../utils/history.js'

const now = () => new Date().toISOString()

export default function useDashboardData() {
  const [devices, setDevices] = useState(mockDevices)
  const [usage, setUsage] = useState(null)
  const [alerts, setAlerts] = useState(null)
  const [powerHistory, setPowerHistory] = useState(() => [{
    power: getTotalPower(null, mockDevices),
    timestamp: mockLastUpdated,
  }])
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const [lastUpdated, setLastUpdated] = useState(mockLastUpdated)
  const [lastConnected, setLastConnected] = useState(null)
  const connectedOnceRef = useRef(false)
  const initialSnapshotSucceededRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    const socket = createDashboardSocket()

    const applySnapshot = (snapshot) => {
      if (cancelled) return
      setDevices(snapshot.devices)
      setUsage(snapshot.usage ?? null)
      setAlerts(snapshot.alerts)
      setLastUpdated(now())
    }

    const syncSnapshot = async () => {
      try {
        const snapshot = await fetchDashboardSnapshot()
        applySnapshot(snapshot)
        return true
      } catch {
        return false
      }
    }

    const handleDevicesUpdate = (payload) => {
      const nextDevices = extractDevices(payload)
      if (!Array.isArray(nextDevices)) return
      setDevices(nextDevices)
      setUsage(null)
      setLastUpdated(now())
    }

    const handleDeviceUpdate = (payload) => {
      const nextDevice = payload?.device ?? payload
      if (!nextDevice?.id) return

      setDevices((currentDevices) => {
        const exists = currentDevices.some((device) => device.id === nextDevice.id)
        if (!exists) return [...currentDevices, nextDevice]
        return currentDevices.map((device) =>
          device.id === nextDevice.id ? { ...device, ...nextDevice } : device,
        )
      })
      setUsage(null)
      setLastUpdated(now())
    }

    const handleUsageUpdate = (payload) => {
      const nextUsage = extractUsage(payload)
      if (!nextUsage || typeof nextUsage !== 'object') return
      setUsage(nextUsage)
      setLastUpdated(now())
    }

    const handleAlertsUpdate = (payload) => {
      const nextAlerts = extractAlerts(payload)
      if (!Array.isArray(nextAlerts)) return
      setAlerts(nextAlerts)
      setLastUpdated(now())
    }

    const handleConnect = async () => {
      if (cancelled) return

      const isReconnect = connectedOnceRef.current
      connectedOnceRef.current = true
      setConnectionStatus('live')
      setLastConnected(now())

      if (isReconnect || !initialSnapshotSucceededRef.current) {
        await syncSnapshot()
      }
    }

    const handleDisconnect = () => {
      if (!cancelled) setConnectionStatus('disconnected')
    }

    const handleConnectError = () => {
      if (cancelled) return
      setConnectionStatus(connectedOnceRef.current ? 'disconnected' : 'mock')
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)
    socket.on('devices:update', handleDevicesUpdate)
    socket.on('device:update', handleDeviceUpdate)
    socket.on('usage:update', handleUsageUpdate)
    socket.on('alerts:update', handleAlertsUpdate)

    const start = async () => {
      const synced = await syncSnapshot()
      initialSnapshotSucceededRef.current = synced

      if (cancelled) return
      setConnectionStatus(synced ? 'live' : 'mock')
      socket.connect()
    }

    start()

    return () => {
      cancelled = true
      socket.removeAllListeners()
      socket.disconnect()
    }
  }, [])

  const totalPower = getTotalPower(usage, devices)

  useEffect(() => {
    setPowerHistory((currentHistory) => appendPowerPoint(currentHistory, totalPower))
  }, [totalPower])

  return {
    devices,
    usage,
    alerts,
    powerHistory,
    connectionStatus,
    lastUpdated,
    lastConnected,
  }
}
