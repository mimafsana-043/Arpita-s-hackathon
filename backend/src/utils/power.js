export const isDeviceOn = (device) => device.status === 'ON'

export const getCurrentPowerW = (device) =>
  isDeviceOn(device) ? Number(device.currentPowerW ?? device.currentPower ?? 0) : 0

export function calculateRoomSummary(devices, roomNames) {
  return Object.fromEntries(roomNames.map((room) => {
    const roomDevices = devices.filter((device) => device.room === room)
    const activeDevices = roomDevices.filter(isDeviceOn)

    const powerW = activeDevices.reduce((total, device) => total + getCurrentPowerW(device), 0)

    return [room, {
      powerW,
      power: powerW,
      activeFans: activeDevices.filter((device) => device.type === 'fan').length,
      activeLights: activeDevices.filter((device) => device.type === 'light').length,
      totalDevicesOn: activeDevices.length,
    }]
  }))
}

export const calculateTotalPowerW = (devices) =>
  devices.reduce((total, device) => total + getCurrentPowerW(device), 0)
