import { useMemo, useState } from 'react'
import AlertsPanel from './components/AlertsPanel.jsx'
import DashboardHeader from './components/DashboardHeader.jsx'
import PowerMeter from './components/PowerMeter.jsx'
import PowerTrend from './components/PowerTrend.jsx'
import RoomCard from './components/RoomCard.jsx'
import OfficeMap from './components/OfficeMap.jsx'
import { roomOrder } from './data/mockDevices.js'
import useDashboardData from './hooks/useDashboardData.js'
import { getTotalPower, isDeviceOn } from './utils/power.js'
import { deriveAlerts } from './utils/alerts.js'

export default function App() {
  const [view, setView] = useState('both')
  const {
    devices,
    usage,
    alerts,
    powerHistory,
    connectionStatus,
    lastUpdated,
    lastConnected,
  } = useDashboardData()
  const activeDevices = devices.filter((device) => isDeviceOn(device.status)).length
  const currentPower = getTotalPower(usage, devices)
  const visibleAlerts = useMemo(
    () => alerts ?? deriveAlerts(devices, currentPower),
    [alerts, currentPower, devices],
  )
  const showMap = view === 'overview' || view === 'both'
  const showDetails = view === 'details' || view === 'both'

  return (
    <div className="app-shell">
      <DashboardHeader
        connectionStatus={connectionStatus}
        lastUpdated={lastUpdated}
        lastConnected={lastConnected}
      />

      <main>
        <section className="overview-strip" aria-label="Office summary">
          <div className="summary-item"><span className="summary-dot summary-dot--green" /><div><strong>{roomOrder.length}</strong><span>Rooms online</span></div></div>
          <div className="summary-item"><span className="summary-dot summary-dot--yellow" /><div><strong>{activeDevices}/{devices.length}</strong><span>Devices active</span></div></div>
          <div className="summary-item"><span className="summary-dot summary-dot--blue" /><div><strong>{currentPower}W</strong><span>Live consumption</span></div></div>
        </section>

        <nav className="view-switcher" aria-label="Dashboard view">
          <div>
            <p className="eyebrow">Workspace view</p>
            <span>Explore the live floor plan or device details</span>
          </div>
          <div className="view-toggle">
            {[
              ['overview', 'Overview'],
              ['details', 'Details'],
              ['both', 'Both'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={view === value ? 'view-toggle__button--active' : ''}
                aria-pressed={view === value}
                onClick={() => setView(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>

        {showMap && (
          <OfficeMap
            devices={devices}
            usage={usage}
            connectionStatus={connectionStatus}
          />
        )}

        {showDetails && <div className="section-intro">
          <div><p className="eyebrow">Room overview</p><h2>What’s running</h2></div>
          <p>Live status across all connected office spaces</p>
        </div>}

        {showDetails && <section className="room-grid" aria-label="Room device status">
          {roomOrder.map((room) => (
            <RoomCard
              key={room}
              room={room}
              devices={devices.filter((device) => device.room === room)}
              usage={usage}
            />
          ))}
        </section>}

        {showDetails && <section className="insights-grid" aria-label="Power and alert insights">
          <PowerTrend history={powerHistory} />
          <PowerMeter devices={devices} rooms={roomOrder} usage={usage} />
          <AlertsPanel alerts={visibleAlerts} />
        </section>}
      </main>

      <footer><span>Smart Office</span><p>Shared backend · REST snapshot + live Socket.IO updates</p></footer>
    </div>
  )
}
