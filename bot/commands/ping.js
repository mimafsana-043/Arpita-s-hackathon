export const name = 'ping'

// No backend call here on purpose — this only proves the bot is online and
// reading Discord messages, independent of whether the backend is reachable.
export async function execute(message) {
  await message.reply('🏓 Pong! I\'m online and listening. Try `!status`, `!room <name>`, or `!usage` next.')
}
