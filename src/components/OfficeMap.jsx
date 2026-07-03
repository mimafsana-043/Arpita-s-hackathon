import { useMemo, useState } from 'react'
import { getDevicePower, getRoomPower, isDeviceOn } from '../utils/power.js'
import './OfficeMap.css'

const ROOM_LAYOUTS = [
  {
    name: 'Drawing Room',
    x: 30,
    devicePositions: {
      fans: [[140, 185], [300, 185]],
      lights: [[95, 300], [220, 300], [345, 300]],
    },
  },
  {
    name: 'Work Room 1',
    x: 410,
    devicePositions: {
      fans: [[520, 185], [680, 185]],
      lights: [[475, 300], [600, 300], [725, 300]],
    },
  },
  {
    name: 'Work Room 2',
    x: 790,
    devicePositions: {
      fans: [[900, 185], [1060, 185]],
      lights: [[855, 300], [980, 300], [1105, 300]],
    },
  },
]

const formatChangedAt = (timestamp) => {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return 'Recently'
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

const sortByName = (devices) => [...devices].sort((a, b) =>
  String(a.name ?? '').localeCompare(String(b.name ?? ''), undefined, { numeric: true }),
)

function MapDevice({ device, fallbackName, type, x, y, selected, onSelect }) {
  const available = Boolean(device)
  const active = available && isDeviceOn(device.status)
  const label = device?.name ?? fallbackName
  const status = available ? (active ? 'ON' : 'OFF') : 'UNAVAILABLE'
  const power = available ? getDevicePower(device) : 0
  const tooltip = `${label}: ${status}, ${power} watts${device?.lastChanged ? `, changed ${formatChangedAt(device.lastChanged)}` : ''}`

  const handleKeyDown = (event) => {
    if (!available || !['Enter', ' '].includes(event.key)) return
    event.preventDefault()
    onSelect(device.id)
  }

  return (
    <g
      className={`map-device map-device--${type} map-device--${active ? 'on' : 'off'} ${available ? '' : 'map-device--missing'} ${selected ? 'map-device--selected' : ''}`}
      transform={`translate(${x} ${y})`}
      role="button"
      tabIndex={available ? 0 : -1}
      aria-label={tooltip}
      aria-pressed={selected}
      onClick={() => available && onSelect(device.id)}
      onKeyDown={handleKeyDown}
    >
      <title>{tooltip}</title>
      <circle className="map-device__target" r="33" />

      {type === 'fan' ? (
        <g className="map-device__fan-rotor">
          <path d="M0-4C-7-12-7-24 1-25c8-1 10 10 5 18L0-4Z" />
          <path d="M3 2c10-1 20 5 17 12-3 8-14 5-19-3L3 2Z" transform="rotate(120)" />
          <path d="M3 2c10-1 20 5 17 12-3 8-14 5-19-3L3 2Z" transform="rotate(240)" />
          <circle r="4" />
        </g>
      ) : (
        <g className="map-device__light">
          <circle r="16" filter={active ? 'url(#light-glow)' : undefined} />
          <path d="M-6 22h12M-4 27h8" />
        </g>
      )}

      <text className="map-device__label" y="45" textAnchor="middle">{label}</text>
      <circle className="map-device__status-dot" cx="22" cy="-22" r="5" />
    </g>
  )
}

const LegendIcon = ({ type }) => (
  <svg viewBox="0 0 28 28" aria-hidden="true">
    {type === 'fan' && <><circle cx="14" cy="14" r="3" /><path d="M14 11c-3-5 4-9 5-4 1 3-2 5-5 4ZM11 15c-6 1-7-7-2-6 3 0 4 3 2 6ZM16 16c3 5-4 9-5 4-1-3 2-5 5-4Z" /></>}
    {type === 'light' && <><circle cx="14" cy="12" r="6" /><path d="M11 21h6" /></>}
    {type === 'door' && <><path d="M5 23V6h14M5 6c8 0 14 6 14 14" /></>}
    {type === 'window' && <><path d="M3 11h22M3 17h22" className="legend-window" /></>}
  </svg>
)

export default function OfficeMap({ devices, usage, connectionStatus }) {
  const [selectedId, setSelectedId] = useState(null)
  const selectedDevice = devices.find((device) => device.id === selectedId)
  const activeCount = devices.filter((device) => isDeviceOn(device.status)).length

  const roomDevices = useMemo(() => Object.fromEntries(ROOM_LAYOUTS.map((room) => {
    const inRoom = devices.filter((device) => device.room === room.name)
    return [room.name, {
      fans: sortByName(inRoom.filter((device) => device.type?.toLowerCase() === 'fan')),
      lights: sortByName(inRoom.filter((device) => device.type?.toLowerCase() === 'light')),
    }]
  })), [devices])

  return (
    <section className="office-map panel" aria-labelledby="office-map-title">
      <div className="office-map__header">
        <div>
          <p className="eyebrow">Interactive office overview</p>
          <h2 id="office-map-title">Live Floor Plan</h2>
          <p>Device status across all three rooms</p>
        </div>
        <div className="office-map__meta">
          <span className={`map-connection map-connection--${connectionStatus}`}>
            <i />{connectionStatus === 'live' ? 'Live map' : connectionStatus === 'mock' ? 'Mock data' : connectionStatus}
          </span>
          <strong>{activeCount}/{devices.length} active</strong>
        </div>
      </div>

      <div className="office-map__legend" aria-label="Floor plan legend">
        {['fan', 'light', 'door', 'window'].map((type) => (
          <span key={type}><LegendIcon type={type} />{type}</span>
        ))}
        <small>Select a device for details</small>
      </div>

      <div className="office-map__scroll">
        <svg className="office-map__svg" viewBox="0 0 1200 430" role="img" aria-label="Top-view office floor plan with Drawing Room, Work Room 1, and Work Room 2">
          <defs>
            <pattern id="floor-grid" width="18" height="18" patternUnits="userSpaceOnUse">
              <path d="M18 0H0V18" />
            </pattern>
            <filter id="light-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <rect className="office-map__floor" x="30" y="50" width="1140" height="330" rx="2" />
          <rect className="office-map__grid" x="30" y="50" width="1140" height="330" />
          <rect className="office-map__outer-wall" x="30" y="50" width="1140" height="330" rx="2" />

          {ROOM_LAYOUTS.map((room, roomIndex) => {
            const currentRoomDevices = roomDevices[room.name]
            const roomPower = getRoomPower(usage, room.name, devices)

            return (
              <g key={room.name}>
                <rect className="office-map__room-zone" x={room.x + 5} y="55" width="370" height="320" />
                <text className="office-map__room-name" x={room.x + 24} y="86">{room.name}</text>
                <text className="office-map__room-power" x={room.x + 350} y="86" textAnchor="end">{roomPower}W</text>

                {room.devicePositions.fans.map(([x, y], index) => (
                  <MapDevice
                    key={`${room.name}-fan-${index + 1}`}
                    device={currentRoomDevices.fans[index]}
                    fallbackName={`Fan ${index + 1}`}
                    type="fan"
                    x={x}
                    y={y}
                    selected={currentRoomDevices.fans[index]?.id === selectedId}
                    onSelect={setSelectedId}
                  />
                ))}
                {room.devicePositions.lights.map(([x, y], index) => (
                  <MapDevice
                    key={`${room.name}-light-${index + 1}`}
                    device={currentRoomDevices.lights[index]}
                    fallbackName={`Light ${index + 1}`}
                    type="light"
                    x={x}
                    y={y}
                    selected={currentRoomDevices.lights[index]?.id === selectedId}
                    onSelect={setSelectedId}
                  />
                ))}

                <g className="office-map__window" aria-label={`${room.name} window`}>
                  <line x1={room.x + 120} x2={room.x + 255} y1="50" y2="50" />
                  <line x1={room.x + 120} x2={room.x + 255} y1="57" y2="57" />
                </g>

                <g className="office-map__door" aria-label={`${room.name} door`}>
                  <line className="office-map__wall-gap" x1={room.x + 150} x2={room.x + 220} y1="380" y2="380" />
                  <path d={`M${room.x + 150} 380V310`} />
                  <path className="office-map__door-swing" d={`M${room.x + 150} 310A70 70 0 0 1 ${room.x + 220} 380`} />
                </g>

                {roomIndex < 2 && <line className="office-map__wall" x1={room.x + 380} x2={room.x + 380} y1="50" y2="380" />}
              </g>
            )
          })}

        </svg>
      </div>

      <div className={`office-map__device-detail ${selectedDevice ? 'office-map__device-detail--visible' : ''}`} aria-live="polite">
        {selectedDevice ? (
          <>
            <span className={`detail-state detail-state--${isDeviceOn(selectedDevice.status) ? 'on' : 'off'}`}><i />{isDeviceOn(selectedDevice.status) ? 'ON' : 'OFF'}</span>
            <div><strong>{selectedDevice.name}</strong><span>{selectedDevice.room}</span></div>
            <div><strong>{getDevicePower(selectedDevice)}W</strong><span>Changed {formatChangedAt(selectedDevice.lastChanged)}</span></div>
            <button type="button" onClick={() => setSelectedId(null)} aria-label="Close device details">×</button>
          </>
        ) : (
          <p>Choose any fan or light to inspect its live state.</p>
        )}
      </div>
    </section>
  )
}
