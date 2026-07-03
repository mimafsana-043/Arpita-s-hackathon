// Mirrors frontend/src/data/mockDevices.js so MOCK_MODE gives the bot the
// same demo numbers the dashboard shows when the backend isn't running.

export const roomOrder = ['Drawing Room', 'Work Room 1', 'Work Room 2']

export const mockDevices = [
  { id: 'drawing_fan_1', name: 'Fan 1', room: 'Drawing Room', type: 'fan', status: 'ON', power: 60, currentPower: 60, lastChanged: '2026-07-03T18:30:00Z' },
  { id: 'drawing_fan_2', name: 'Fan 2', room: 'Drawing Room', type: 'fan', status: 'ON', power: 60, currentPower: 60, lastChanged: '2026-07-03T17:52:00Z' },
  { id: 'drawing_light_1', name: 'Light 1', room: 'Drawing Room', type: 'light', status: 'ON', power: 15, currentPower: 15, lastChanged: '2026-07-03T18:12:00Z' },
  { id: 'drawing_light_2', name: 'Light 2', room: 'Drawing Room', type: 'light', status: 'on', power: 15, currentPower: 15, lastChanged: '2026-07-03T18:13:00Z' },
  { id: 'drawing_light_3', name: 'Light 3', room: 'Drawing Room', type: 'light', status: 'OFF', power: 15, currentPower: 0, lastChanged: '2026-07-03T16:45:00Z' },

  { id: 'work_1_fan_1', name: 'Fan 1', room: 'Work Room 1', type: 'fan', status: 'ON', power: 60, currentPower: 60, lastChanged: '2026-07-03T18:05:00Z' },
  { id: 'work_1_fan_2', name: 'Fan 2', room: 'Work Room 1', type: 'fan', status: 'off', power: 60, currentPower: 0, lastChanged: '2026-07-03T17:36:00Z' },
  { id: 'work_1_light_1', name: 'Light 1', room: 'Work Room 1', type: 'light', status: 'ON', power: 15, currentPower: 15, lastChanged: '2026-07-03T18:22:00Z' },
  { id: 'work_1_light_2', name: 'Light 2', room: 'Work Room 1', type: 'light', status: 'OFF', power: 15, currentPower: 0, lastChanged: '2026-07-03T17:48:00Z' },
  { id: 'work_1_light_3', name: 'Light 3', room: 'Work Room 1', type: 'light', status: 'ON', power: 15, currentPower: 15, lastChanged: '2026-07-03T18:25:00Z' },

  { id: 'work_2_fan_1', name: 'Fan 1', room: 'Work Room 2', type: 'fan', status: 'ON', power: 60, currentPower: 60, lastChanged: '2026-07-03T18:08:00Z' },
  { id: 'work_2_fan_2', name: 'Fan 2', room: 'Work Room 2', type: 'fan', status: 'ON', power: 60, currentPower: 60, lastChanged: '2026-07-03T18:09:00Z' },
  { id: 'work_2_light_1', name: 'Light 1', room: 'Work Room 2', type: 'light', status: 'ON', power: 15, currentPower: 15, lastChanged: '2026-07-03T18:31:00Z' },
  { id: 'work_2_light_2', name: 'Light 2', room: 'Work Room 2', type: 'light', status: 'OFF', power: 15, currentPower: 0, lastChanged: '2026-07-03T16:58:00Z' },
  { id: 'work_2_light_3', name: 'Light 3', room: 'Work Room 2', type: 'light', status: 'OFF', power: 15, currentPower: 0, lastChanged: '2026-07-03T17:14:00Z' },
]

export const mockAlerts = [
  {
    id: 'alert-1',
    message: 'Fan has been running for over 3 hours',
    room: 'Drawing Room',
    timestamp: '2026-07-03T18:35:00Z',
    severity: 'warning',
  },
  {
    id: 'alert-2',
    message: 'Multiple devices active after office hours',
    room: 'Work Room 2',
    timestamp: '2026-07-03T18:40:00Z',
    severity: 'high',
  },
]
