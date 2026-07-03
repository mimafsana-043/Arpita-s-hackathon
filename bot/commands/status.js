import { fetchDevices } from '../services/apiClient.js'
import { buildStatusText } from '../services/responseFormatter.js'
import { humanize } from '../services/llm.js'

export const name = 'status'

export async function execute(message) {
  const devices = await fetchDevices()
  const factual = buildStatusText(devices)
  await message.reply(await humanize(factual))
}
