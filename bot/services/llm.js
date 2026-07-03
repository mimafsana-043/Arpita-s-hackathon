import Anthropic from '@anthropic-ai/sdk'

const apiKey = process.env.ANTHROPIC_API_KEY
const model = process.env.LLM_MODEL || 'claude-haiku-4-5-20251001'
const client = apiKey ? new Anthropic({ apiKey }) : null

const SYSTEM_PROMPT = [
  'You rephrase office energy-monitoring facts into one short, friendly sentence',
  'for a busy office manager reading Discord. Never add, remove, change, or invent',
  'any number or fact that is not already present in the input. Reply with only',
  'the rephrased sentence, nothing else.',
].join(' ')

// Optional: only active when ANTHROPIC_API_KEY is set. Falls back to the exact
// deterministic input text on any error (missing key, network failure, bad
// response), so the bot always works even without an LLM configured.
export async function humanize(factualText) {
  if (!client) return factualText

  try {
    const response = await client.messages.create({
      model,
      max_tokens: 200,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: factualText }],
    })

    const text = response.content?.find((block) => block.type === 'text')?.text?.trim()
    return text || factualText
  } catch (error) {
    console.error('[llm] humanize failed, using template text instead:', error.message)
    return factualText
  }
}
