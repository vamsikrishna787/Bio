// A small hand-rolled orchestrator/sub-agent framework: one OrchestratorAgent
// fans a task out to independent SubAgents running concurrently, then
// aggregates their results. It's deliberately dependency-free so it runs
// entirely client-side with no backend — the Lab tab visualizes each step.
//
// The airline "queries" are simulated (no live flight API is wired up — see
// the Lab settings panel for why real Bedrock/API calls from a public static
// site are handled as an opt-in, BYO-credentials mode instead). The final
// summary step DOES call real Bedrock via bedrockClient.ts when a visitor has
// configured live credentials, and falls back to a local summary otherwise.

import { invokeBedrockSummary, isBedrockLiveAvailable } from './bedrockClient'

export interface AgentEvent {
  id: string
  agent: string
  message: string
  kind: 'info' | 'success' | 'error'
  timestamp: number
}

export interface FlightQuote {
  airline: string
  price: number
  durationMins: number
}

export interface OrchestrationResult {
  quotes: FlightQuote[]
  cheapest: FlightQuote
  summary: string
  liveBedrock: boolean
}

export interface FlightRoute {
  origin: string
  destination: string
  date: string
}

const AIRLINES: { name: string; base: number; variance: number }[] = [
  { name: 'Delta', base: 240, variance: 60 },
  { name: 'United', base: 255, variance: 70 },
  { name: 'American', base: 230, variance: 50 },
  { name: 'Southwest', base: 210, variance: 40 },
]

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function randomDelay(min = 700, max = 1700) {
  return min + Math.random() * (max - min)
}

export async function runFlightOrchestration(
  route: FlightRoute,
  onEvent: (event: AgentEvent) => void,
): Promise<OrchestrationResult> {
  const emit = (agent: string, message: string, kind: AgentEvent['kind'] = 'info') =>
    onEvent({ id: crypto.randomUUID(), agent, message, kind, timestamp: Date.now() })

  emit('Orchestrator', `Planning task: cheapest flight ${route.origin} → ${route.destination} on ${route.date}`)
  await sleep(400)
  emit('Orchestrator', `Dispatching to ${AIRLINES.length} airline sub-agents in parallel...`)

  const quotes = await Promise.all(
    AIRLINES.map(async (airline) => {
      await sleep(randomDelay())
      const price = Math.round((airline.base + Math.random() * airline.variance) * 100) / 100
      const durationMins = 180 + Math.round(Math.random() * 90)
      emit(`${airline.name} Agent`, `Found fare $${price.toFixed(2)} · ${durationMins} min`, 'success')
      return { airline: airline.name, price, durationMins }
    }),
  )

  emit('Orchestrator', `All ${quotes.length} sub-agents reported back. Comparing results...`)
  await sleep(400)
  const cheapest = quotes.reduce((a, b) => (b.price < a.price ? b : a))
  const average = quotes.reduce((sum, q) => sum + q.price, 0) / quotes.length

  let summary = `Cheapest option is ${cheapest.airline} at $${cheapest.price.toFixed(2)} (${cheapest.durationMins} min flight), vs. an average of $${average.toFixed(2)} across ${quotes.length} carriers.`
  let liveBedrock = false

  if (isBedrockLiveAvailable()) {
    try {
      emit('Orchestrator', 'Live Bedrock credentials detected — asking the model to summarize...')
      const prompt = `You are a travel booking assistant. Given these flight quotes for ${route.origin} to ${route.destination}: ${quotes
        .map((q) => `${q.airline} $${q.price.toFixed(2)}`)
        .join(', ')}. In one concise sentence, recommend the cheapest option and note the savings vs the average.`
      summary = (await invokeBedrockSummary(prompt)).trim()
      liveBedrock = true
      emit('Orchestrator', 'Received live Bedrock summary.', 'success')
    } catch (err) {
      emit('Orchestrator', `Live Bedrock call failed (${(err as Error).message}) — using local summary.`, 'error')
    }
  }

  emit('Orchestrator', summary, 'success')
  return { quotes, cheapest, summary, liveBedrock }
}

export const FLIGHT_AGENT_NAMES = AIRLINES.map((a) => `${a.name} Agent`)
