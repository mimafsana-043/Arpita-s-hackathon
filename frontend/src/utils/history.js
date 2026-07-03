export const MAX_POWER_HISTORY_POINTS = 100

export function appendPowerPoint(history, power, timestamp = new Date().toISOString()) {
  const numericPower = Number(power) || 0
  const latestPoint = history[history.length - 1]

  if (latestPoint?.power === numericPower) return history

  return [
    ...history,
    { power: numericPower, timestamp },
  ].slice(-MAX_POWER_HISTORY_POINTS)
}
