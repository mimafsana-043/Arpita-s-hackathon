import { getDevicePower, isDeviceOn } from '../utils/power.js'

const FanIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="1.7" />
    <path d="M12.4 10.2C10.8 7.4 11.8 3 14.6 3c2.6 0 2.6 3.8.8 5.6a7 7 0 0 1-3 1.6ZM10.3 12.2C7 12.3 3.7 9.4 5.2 7c1.3-2.3 4.6-.3 5.3 2a7 7 0 0 1-.2 3.2ZM13.2 13.3c1.7 2.7.6 7.1-2.2 7-2.6 0-2.5-3.9-.7-5.6a7 7 0 0 1 2.9-1.4Z" />
  </svg>
)

const LightIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 18h6M9.5 21h5M8.4 15.4A6 6 0 1 1 15.6 15.4c-.8.6-1.1 1.4-1.1 2.1h-5c0-.7-.3-1.5-1.1-2.1Z" />
  </svg>
)

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return 'recently'
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date)
}

export default function DeviceIndicator({ device }) {
  const active = isDeviceOn(device.status)

  return (
    <article className={`device ${active ? 'device--active' : 'device--inactive'}`}>
      <div className="device-icon">{device.type === 'fan' ? <FanIcon /> : <LightIcon />}</div>
      <div className="device-details">
        <div className="device-name-row">
          <h3>{device.name}</h3>
          <span className="device-state"><i />{active ? 'ON' : 'OFF'}</span>
        </div>
        <div className="device-meta">
          <strong>{getDevicePower(device)}W</strong>
          <span>Changed {formatTime(device.lastChanged)}</span>
        </div>
      </div>
    </article>
  )
}
