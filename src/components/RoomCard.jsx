import DeviceIndicator from './DeviceIndicator.jsx'
import { getRoomPower, isDeviceOn } from '../utils/power.js'

const RoomIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 10.5 12 3l9 7.5M5.5 9v11h13V9M9 20v-6h6v6" />
  </svg>
)

export default function RoomCard({ room, devices, usage }) {
  const roomPower = getRoomPower(usage, room, devices)
  const activeDevices = devices.filter((device) => isDeviceOn(device.status))
  const activeFans = activeDevices.filter((device) => device.type?.toLowerCase() === 'fan').length
  const activeLights = activeDevices.filter((device) => device.type?.toLowerCase() === 'light').length
  const status = activeDevices.length === 0
    ? { label: 'All Off', className: 'off' }
    : activeDevices.length === devices.length
      ? { label: 'Fully Active', className: 'full' }
      : { label: 'Partially Active', className: 'partial' }

  return (
    <section className="room-card" aria-labelledby={`${room.replaceAll(' ', '-')}-title`}>
      <div className="room-card__header">
        <div className="room-title-wrap">
          <span className="room-icon"><RoomIcon /></span>
          <div>
            <h2 id={`${room.replaceAll(' ', '-')}-title`}>{room}</h2>
            <span className={`room-status room-status--${status.className}`}>{status.label}</span>
          </div>
        </div>
        <div className="room-power"><strong>{roomPower}</strong><span>watts</span></div>
      </div>

      <div className="room-summary" aria-label={`${room} active device summary`}>
        <span><strong>{activeFans}</strong> {activeFans === 1 ? 'fan' : 'fans'} active</span>
        <span><strong>{activeLights}</strong> {activeLights === 1 ? 'light' : 'lights'} active</span>
      </div>

      <div className="device-list">
        {devices.map((device) => <DeviceIndicator key={device.id} device={device} />)}
      </div>
    </section>
  )
}
