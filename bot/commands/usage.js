import { fetchDevices, fetchUsage } from '../services/apiClient.js'
import { buildUsageText } from '../services/responseFormatter.js'
import { humanize } from '../services/llm.js'

export const name = 'usage'

export async function execute(message) {
  const [devices, usage] = await Promise.all([fetchDevices(), fetchUsage()])
  const factual = buildUsageText(usage, devices)
  await message.reply(await humanize(factual))
}
