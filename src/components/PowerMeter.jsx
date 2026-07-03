import {
  calculateCapacity,
  getRoomPower,
  getTotalPower,
} from '../utils/power.js'

const GaugeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 17a8 8 0 1 1 16 0M12 17l4-5M7 17h10" />
  </svg>
)

export default function PowerMeter({ devices, rooms, usage }) {
  const totalPower = getTotalPower(usage, devices)
  const totalCapacity = calculateCapacity(devices)
  const percentage = totalCapacity > 0
    ? Math.min(100, Math.round((totalPower / totalCapacity) * 100))
    : 0

  return (
    <section className="power-panel panel" aria-labelledby="power-title">
      <div className="panel-heading">
        <span className="panel-icon"><GaugeIcon /></span>
        <div><p className="eyebrow">Energy right now</p><h2 id="power-title">Power usage</h2></div>
      </div>

      <div className="power-total">
        <div><strong key={totalPower} className="power-value">{totalPower}</strong><span>W</span></div>
        <p>of {totalCapacity}W available capacity</p>
      </div>

      <div className="main-meter" aria-label={`${percentage}% of available power capacity in use`}>
        <span style={{ width: `${percentage}%` }} />
      </div>
      <div className="meter-caption"><span>Low usage</span><strong>{percentage}% in use</strong></div>

      <div className="room-breakdown">
        {rooms.map((room) => {
          const roomDevices = devices.filter((device) => device.room === room)
          const roomCapacity = calculateCapacity(roomDevices)
          const roomPower = getRoomPower(usage, room, devices)
          const roomPercentage = roomCapacity > 0
            ? Math.min(100, Math.round((roomPower / roomCapacity) * 100))
            : 0

          return (
            <div className="breakdown-row" key={room}>
              <div><span>{room}</span><strong>{roomPower}W</strong></div>
              <div className="mini-meter"><span style={{ width: `${roomPercentage}%` }} /></div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
