const BellIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
  </svg>
)

const formatAlertTime = (timestamp) => {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return 'Recently'

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

const getSeverity = (severity) => {
  const normalized = severity?.toLowerCase()
  if (['high', 'critical', 'error'].includes(normalized)) return 'high'
  if (['medium', 'warning', 'warn'].includes(normalized)) return 'medium'
  return 'low'
}

export default function AlertsPanel({ alerts }) {
  return (
    <section className="alerts-panel panel" aria-labelledby="alerts-title">
      <div className="panel-heading alerts-heading">
        <div className="heading-left">
          <span className="panel-icon panel-icon--alert"><BellIcon /></span>
          <div><p className="eyebrow">Needs attention</p><h2 id="alerts-title">Active alerts</h2></div>
        </div>
        <span className="alert-count">{alerts.length}</span>
      </div>

      {alerts.length === 0 ? (
        <p className="no-alerts">No active alerts. Office looks good.</p>
      ) : (
        <div className="alert-list">
          {alerts.map((alert, index) => {
            const severity = getSeverity(alert.severity)
            const detail = [alert.room, alert.category ?? alert.reason].filter(Boolean).join(' · ')

            return (
              <article className={`alert alert--${severity}`} key={alert.id ?? `${alert.message}-${index}`}>
                <span className="severity-dot" />
                <div className="alert-copy">
                  <div className="alert-topline">
                    <span className="severity-label">{severity}</span>
                    {alert.timestamp && <time dateTime={alert.timestamp}>{formatAlertTime(alert.timestamp)}</time>}
                  </div>
                  <h3>{alert.message}</h3>
                  {detail && <p>{detail}</p>}
                  {alert.reason && alert.category && <small>{alert.reason}</small>}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
