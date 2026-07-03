import 'dotenv/config'
import { Client, Events, GatewayIntentBits } from 'discord.js'
import { fetchAlerts } from './services/apiClient.js'
import { buildAlertText } from './services/responseFormatter.js'
import { createAlertSocket } from './services/socketClient.js'
import * as pingCommand from './commands/ping.js'
import * as roomCommand from './commands/room.js'
import * as statusCommand from './commands/status.js'
import * as usageCommand from './commands/usage.js'

if (!process.env.DISCORD_BOT_TOKEN) {
  console.error('[startup] Missing DISCORD_BOT_TOKEN. Copy .env.example to .env and fill it in.')
  process.exit(1)
}

const PREFIX = process.env.COMMAND_PREFIX || '!'
const ALERT_POLL_INTERVAL_MS = Number(process.env.ALERT_POLL_INTERVAL_MS) || 30000
const ALERT_CHANNEL_ID = process.env.ALERT_CHANNEL_ID

const commands = new Map(
  [pingCommand, statusCommand, roomCommand, usageCommand].map((command) => [command.name, command]),
)

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

client.once(Events.ClientReady, (readyClient) => {
  console.log(`[startup] Logged in as ${readyClient.user.tag}`)
  startAlertWatch(readyClient)
})

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return

  const [rawCommand, ...args] = message.content.slice(PREFIX.length).trim().split(/\s+/)
  const command = commands.get(rawCommand?.toLowerCase())
  if (!command) return

  try {
    await command.execute(message, args)
  } catch (error) {
    console.error(`[command:${rawCommand}] failed:`, error)
    await message.reply("Hmm, I can't reach the office system right now — try again in a bit.").catch(() => {})
  }
})

// De-duped across both the polling path and the Socket.IO bonus path, so an
// alert that arrives on the socket and again on the next poll is only posted once.
const postedAlertIds = new Set()

async function postNewAlerts(alerts, readyClient) {
  if (!ALERT_CHANNEL_ID) return

  const unseen = alerts.filter((alert) => alert.id && !postedAlertIds.has(alert.id))
  if (unseen.length === 0) return

  const channel = await readyClient.channels.fetch(ALERT_CHANNEL_ID).catch((error) => {
    console.error('[alerts] could not fetch alert channel:', error.message)
    return null
  })
  if (!channel) return

  for (const alert of unseen) {
    postedAlertIds.add(alert.id)
    await channel.send(buildAlertText(alert)).catch((error) => {
      console.error('[alerts] failed to post alert:', error.message)
    })
  }
}

function startAlertWatch(readyClient) {
  createAlertSocket((alerts) => postNewAlerts(alerts, readyClient))

  setInterval(async () => {
    try {
      const alerts = await fetchAlerts()
      await postNewAlerts(alerts, readyClient)
    } catch (error) {
      console.error('[alerts] poll failed:', error.message)
    }
  }, ALERT_POLL_INTERVAL_MS)
}

client.login(process.env.DISCORD_BOT_TOKEN)
