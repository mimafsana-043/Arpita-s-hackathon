const BoltIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M13.2 2 5 13h6l-.7 9L19 10h-6l.2-8Z" />
  </svg>
)

const formatTimestamp = (timestamp) =>
  new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
  }).format(new Date(timestamp))

const statusContent = {
  connecting: { label: 'Connecting', className: 'connection-badge--connecting' },
  live: { label: 'Live', className: 'connection-badge--live' },
  disconnected: { label: 'Backend Disconnected', className: 'connection-badge--disconnected' },
  mock: { label: 'Mock Mode · Backend Disconnected', className: 'connection-badge--mock' },
}

export default function DashboardHeader({ connectionStatus, lastUpdated, lastConnected }) {
  const status = statusContent[connectionStatus] ?? statusContent.connecting

  return (
    <header className="dashboard-header">
      <div className="brand-block">
        <div className="brand-mark"><BoltIcon /></div>
        <div>
          <p className="eyebrow">Live energy overview</p>
          <h1>Smart Office Energy Dashboard</h1>
          <p className="subtitle">Real-time lights and fans monitoring</p>
        </div>
      </div>

      <div className="header-status" aria-label="Dashboard status">
        <span className={`connection-badge ${status.className}`}>
          <span className="pulse-dot" />{status.label}
        </span>
        <span className="updated-time">
          <span>Last updated</span>
          <strong>{formatTimestamp(lastUpdated)}</strong>
          {lastConnected && <small>Connected {formatTimestamp(lastConnected)}</small>}
        </span>
      </div>
    </header>
  )
}
