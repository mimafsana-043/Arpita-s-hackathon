const CHART_WIDTH = 640
const CHART_HEIGHT = 180
const PADDING_X = 18
const PADDING_Y = 18

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

const createChart = (history) => {
  if (history.length === 0) {
    return { points: [], line: '', area: '', min: 0, max: 0 }
  }

  const values = history.map((point) => Number(point.power) || 0)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(max - min, 1)
  const usableWidth = CHART_WIDTH - PADDING_X * 2
  const usableHeight = CHART_HEIGHT - PADDING_Y * 2

  const points = history.map((point, index) => {
    const x = history.length === 1
      ? PADDING_X + usableWidth / 2
      : PADDING_X + (index / (history.length - 1)) * usableWidth
    const y = max === min
      ? PADDING_Y + usableHeight / 2
      : PADDING_Y + ((max - Number(point.power)) / range) * usableHeight
    return { ...point, x, y }
  })

  const line = points.map((point) => `${point.x},${point.y}`).join(' ')
  const area = points.length > 0
    ? `M ${points[0].x} ${CHART_HEIGHT - PADDING_Y} L ${points.map((point) => `${point.x} ${point.y}`).join(' L ')} L ${points[points.length - 1].x} ${CHART_HEIGHT - PADDING_Y} Z`
    : ''

  return { points, line, area, min, max }
}

export default function PowerTrend({ history }) {
  const safeHistory = history.slice(-100)
  const chart = createChart(safeHistory)
  const latest = safeHistory[safeHistory.length - 1]
  const first = safeHistory[0]
  const latestPoint = chart.points[chart.points.length - 1]

  return (
    <section className="trend-panel panel" aria-labelledby="trend-title">
      <div className="trend-heading">
        <div>
          <p className="eyebrow">Rolling live window</p>
          <h2 id="trend-title">Recent Power Trend</h2>
        </div>
        <div className="trend-latest">
          <strong>{latest?.power ?? 0}W</strong>
          <span>{safeHistory.length} of 100 points</span>
        </div>
      </div>

      <div className="chart-wrap">
        <div className="chart-y-labels"><span>{chart.max}W</span><span>{chart.min}W</span></div>
        <svg
          className="power-chart"
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          role="img"
          aria-label={`Power trend with ${safeHistory.length} points. Latest value ${latest?.power ?? 0} watts.`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#18a873" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#18a873" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <line className="chart-grid" x1="0" x2={CHART_WIDTH} y1="18" y2="18" />
          <line className="chart-grid" x1="0" x2={CHART_WIDTH} y1="90" y2="90" />
          <line className="chart-grid" x1="0" x2={CHART_WIDTH} y1="162" y2="162" />
          {chart.area && <path className="chart-area" d={chart.area} />}
          {chart.line && <polyline className="chart-line" points={chart.line} />}
          {latestPoint && <circle className="chart-current" cx={latestPoint.x} cy={latestPoint.y} r="5" />}
        </svg>
      </div>

      <div className="chart-time-labels">
        <span>{first ? formatTime(first.timestamp) : 'Waiting for data'}</span>
        <span>{latest ? formatTime(latest.timestamp) : ''}</span>
      </div>
    </section>
  )
}
