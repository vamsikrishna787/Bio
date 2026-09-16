// John (orchestrator) + two sub-agents (Scheduling, Gmail), talking to a real
// deployed backend (see the sibling `Assistant` repo) when a visitor has
// opted into "Live assistant" via AssistantSettings, and running a fully
// simulated demo otherwise — same BYO-credentials philosophy as the Lab
// tab's flightOrchestrator.ts, for the same reason: a public static site
// should never ship long-lived tokens to real infrastructure in its bundle.

import { getAssistantConnection } from './assistantConfig'

export type AgentName = 'John' | 'Scheduling Agent' | 'Gmail Agent'

export interface AgentEvent {
  id: string
  agent: AgentName
  message: string
  kind: 'info' | 'success' | 'error'
  timestamp: number
}

export interface ChatTurn {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export interface PendingApproval {
  approvalCode: string
  kind: 'scheduling' | 'gmail_draft'
  summary: string
}

export interface ChatTurnResult {
  reply: string
  agentEvents: AgentEvent[]
  pendingApproval: PendingApproval | null
  live: boolean
}

function emitId() {
  return crypto.randomUUID()
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function isAssistantLive(): boolean {
  return getAssistantConnection() !== null
}

// ---------------------------------------------------------------------------
// Live mode — talks to the real John orchestrator over HTTPS.
// ---------------------------------------------------------------------------

async function liveSendChat(sessionId: string, message: string): Promise<ChatTurnResult> {
  const conn = getAssistantConnection()
  if (!conn) throw new Error('No live assistant connection configured')

  const res = await fetch(`${conn.apiBaseUrl.replace(/\/$/, '')}/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-assistant-token': conn.token },
    body: JSON.stringify({ session_id: sessionId, message }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Assistant API returned ${res.status}: ${body || res.statusText}`)
  }
  const data = await res.json()
  const agentEvents: AgentEvent[] = (data.agent_events ?? []).map((e: any) => ({
    id: emitId(),
    agent: e.agent,
    message: e.message,
    kind: e.kind ?? 'info',
    timestamp: Date.now(),
  }))
  const pendingApproval: PendingApproval | null = data.pending_approval
    ? {
        approvalCode: data.pending_approval.approval_code,
        kind: data.pending_approval.kind,
        summary: data.pending_approval.summary,
      }
    : null

  return { reply: data.reply, agentEvents, pendingApproval, live: true }
}

/** Polls conversation history — used to notice an approval resolved via SMS while this tab was open. */
export async function livePollPendingApproval(sessionId: string): Promise<PendingApproval | null> {
  const conn = getAssistantConnection()
  if (!conn) return null
  try {
    const res = await fetch(`${conn.apiBaseUrl.replace(/\/$/, '')}/chat/${sessionId}`, {
      headers: { 'x-assistant-token': conn.token },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.pending_approval
      ? {
          approvalCode: data.pending_approval.approval_code,
          kind: data.pending_approval.kind,
          summary: data.pending_approval.summary,
        }
      : null
  } catch {
    return null
  }
}

export async function resolveApproval(approvalCode: string, approved: boolean): Promise<{ ok: boolean; message: string }> {
  const conn = getAssistantConnection()
  if (!conn) {
    // Demo mode — nothing real to resolve, just acknowledge.
    await sleep(400)
    return { ok: true, message: approved ? 'Approved (demo — nothing was actually booked/sent).' : 'Declined (demo).' }
  }
  const res = await fetch(`${conn.apiBaseUrl.replace(/\/$/, '')}/approve/${approvalCode}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-assistant-token': conn.token },
    body: JSON.stringify({ action: approved ? 'approve' : 'deny' }),
  })
  const data = await res.json().catch(() => ({}))
  return { ok: Boolean(data.ok), message: data.message ?? (res.ok ? 'Done.' : `Request failed (${res.status}).`) }
}

// ---------------------------------------------------------------------------
// Demo mode — no backend required, runs entirely in the browser.
// ---------------------------------------------------------------------------

const DEMO_PLACES = [
  { name: 'Sunrise Salon', base: 45 },
  { name: 'Downtown Cuts', base: 38 },
  { name: 'The Grooming Room', base: 55 },
]

function classifyDemoIntent(message: string): 'scheduling' | 'gmail' | 'chat' {
  const m = message.toLowerCase()
  if (/\b(book|schedule|appointment|reserve|call.*(salon|place|shop|office|restaurant))\b/.test(m)) return 'scheduling'
  if (/\b(email|gmail|inbox|reply|draft)\b/.test(m)) return 'gmail'
  return 'chat'
}

async function demoSendChat(message: string, onEvent: (e: AgentEvent) => void): Promise<ChatTurnResult> {
  const emit = (agent: AgentName, msg: string, kind: AgentEvent['kind'] = 'info') => {
    const event: AgentEvent = { id: emitId(), agent, message: msg, kind, timestamp: Date.now() }
    onEvent(event)
    return event
  }

  const intent = classifyDemoIntent(message)

  if (intent === 'scheduling') {
    emit('John', 'Handing this off to the scheduling agent.')
    await sleep(300)
    for (const place of DEMO_PLACES) {
      await sleep(400 + Math.random() * 500)
      const price = (place.base + Math.random() * 20).toFixed(2)
      emit('Scheduling Agent', `Called ${place.name} — quoted $${price}.`, 'success')
    }
    const cheapest = DEMO_PLACES[Math.floor(Math.random() * DEMO_PLACES.length)]
    const code = String(Math.floor(100 + Math.random() * 900))
    const summary = `Cheapest option: ${cheapest.name} at ~$${cheapest.base.toFixed(2)}. Approve to book (demo — this is simulated, no real call was placed).`
    emit('Scheduling Agent', 'Got quotes back — waiting on your approval before booking anything.', 'info')
    return {
      reply: "I called a few places and got quotes — I won't book anything until you approve below (in the live system, you'd also get this as a text you can reply YES/NO to).",
      agentEvents: [],
      pendingApproval: { approvalCode: code, kind: 'scheduling', summary },
      live: false,
    }
  }

  if (intent === 'gmail') {
    emit('John', 'Handing this off to the Gmail agent.')
    await sleep(400)
    emit('Gmail Agent', 'Scanned your inbox — found 1 unread message that looks like it needs a reply.', 'success')
    await sleep(400)
    const code = String(Math.floor(100 + Math.random() * 900))
    const summary =
      'Draft reply to recruiter@example.com re: "Quick question about your availability"\n\n' +
      '"Thanks for reaching out! I\'m open to a call next week — Tuesday or Wednesday afternoon both work. Let me know what\'s best for you."'
    emit('Gmail Agent', 'Drafted a reply — waiting on your approval before sending.', 'info')
    return {
      reply: "I found a message worth replying to and drafted a response — nothing gets sent until you approve it below (in the live system, you'd also get this as a text).",
      agentEvents: [],
      pendingApproval: { approvalCode: code, kind: 'gmail_draft', summary },
      live: false,
    }
  }

  await sleep(500)
  emit('John', 'Thinking it through…')
  return {
    reply:
      "I'm John — I coordinate two specialists: one that calls places to book appointments (with your approval before anything's confirmed), and one that drafts Gmail replies (with your approval before anything's sent). Try: \"book me a haircut\" or \"check my email\".",
    agentEvents: [],
    pendingApproval: null,
    live: false,
  }
}

// ---------------------------------------------------------------------------
// Public entry point used by AssistantTab — picks live vs demo automatically.
// ---------------------------------------------------------------------------

export async function sendChatMessage(
  sessionId: string,
  message: string,
  onEvent: (e: AgentEvent) => void,
): Promise<ChatTurnResult> {
  if (isAssistantLive()) {
    try {
      onEvent({ id: emitId(), agent: 'John', message: 'Sending to the live assistant…', kind: 'info', timestamp: Date.now() })
      return await liveSendChat(sessionId, message)
    } catch (err) {
      onEvent({
        id: emitId(),
        agent: 'John',
        message: `Live assistant call failed (${(err as Error).message}) — falling back to the demo.`,
        kind: 'error',
        timestamp: Date.now(),
      })
      return demoSendChat(message, onEvent)
    }
  }
  return demoSendChat(message, onEvent)
}
