import { fetchDevices, fetchUsage } from '../services/apiClient.js'
import { buildRoomDeviceLines, buildRoomSummary } from '../services/responseFormatter.js'
import { humanize } from '../services/llm.js'
import { resolveRoomName, ROOM_ALIASES } from '../services/rooms.js'

export const name = 'room'

export async function execute(message, args) {
  const input = args[0]
  const validRooms = [...new Set(Object.keys(ROOM_ALIASES))].join(', ')

  if (!input) {
    await message.reply(`Which room did you mean? Try: ${validRooms}`)
    return
  }

  const roomName = resolveRoomName(input)
  if (!roomName) {
    await message.reply(`I don't know a room called "${input}". Valid options: ${validRooms}`)
    return
  }

  const [devices, usage] = await Promise.all([fetchDevices(), fetchUsage()])
  const summary = await humanize(buildRoomSummary(roomName, devices, usage))
  const deviceLines = buildRoomDeviceLines(roomName, devices).map((line) => `• ${line}`)

  await message.reply(`${summary}\n${deviceLines.join('\n')}`)
}
