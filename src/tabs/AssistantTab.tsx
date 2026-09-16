import { useEffect, useRef, useState } from 'react'
import {
  getAssistantConnection,
  getOrCreateSessionId,
  setAssistantConnection,
  type AssistantConnection,
} from '../lib/assistantConfig'
import {
  isAssistantLive,
  livePollPendingApproval,
  resolveApproval,
  sendChatMessage,
  type AgentEvent,
  type AgentName,
  type ChatTurn,
  type PendingApproval,
} from '../lib/assistantOrchestrator'
import { AssistantSettings } from '../features/assistant/AssistantSettings'
import { OrchestratorVisual, type AgentStatus } from '../features/lab/OrchestratorVisual'

const SUB_AGENT_NAMES: AgentName[] = ['Scheduling Agent', 'Gmail Agent']

const SUGGESTIONS = [
  'Book me a haircut for Saturday at Sunrise Salon, (555) 010-2222',
  'Check my email for anything that needs a reply',
  'What can you help me with?',
]

export function AssistantTab() {
  const [sessionId] = useState(() => getOrCreateSessionId())
  const [connection, setConnection] = useState<AssistantConnection | null>(() => getAssistantConnection())
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatTurn[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [events, setEvents] = useState<AgentEvent[]>([])
  const [statuses, setStatuses] = useState<Record<string, AgentStatus>>({})
  const [pendingApproval, setPendingApproval] = useState<PendingApproval | null>(null)
  const [resolving, setResolving] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const logRef = useRef<HTMLDivElement>(null)

  const live = isAssistantLive()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // While an approval is pending in live mode, poll in case it gets resolved
  // over SMS instead of via the button below.
  useEffect(() => {
    if (!pendingApproval || !live) return
    const interval = setInterval(async () => {
      const stillPending = await livePollPendingApproval(sessionId)
      if (!stillPending) {
        setPendingApproval(null)
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'assistant', content: 'That approval was resolved (check your texts) — refresh to see the full result.' },
        ])
      }
    }, 4000)
    return () => clearInterval(interval)
  }, [pendingApproval, live, sessionId])

  function pushEvent(event: AgentEvent) {
    setEvents((prev) => [...prev, event])
    setStatuses((prev) => ({
      ...prev,
      [event.agent]: event.agent === 'John' ? 'active' : event.kind === 'error' ? 'error' : 'done',
    }))
    requestAnimationFrame(() => logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' }))
  }

  async function handleSend(text?: string) {
    const content = (text ?? input).trim()
    if (!content || sending) return
    setInput('')
    setSending(true)
    setStatuses({ John: 'active' })
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', content }])

    const result = await sendChatMessage(sessionId, content, pushEvent)

    setStatuses((prev) => ({ ...prev, John: 'done' }))
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: result.reply }])
    if (result.pendingApproval) setPendingApproval(result.pendingApproval)
    setSending(false)
  }

  async function handleApprove(approved: boolean) {
    if (!pendingApproval) return
    setResolving(true)
    const result = await resolveApproval(pendingApproval.approvalCode, approved)
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: result.message }])
    setPendingApproval(null)
    setResolving(false)
  }

  function saveConnection(conn: AssistantConnection) {
    setAssistantConnection(conn)
    setConnection(conn)
  }

  function clearConnection() {
    setAssistantConnection(null)
    setConnection(null)
  }

  return (
    <section className="tight">
      <div className="wrap">
        <div className="section-head fade-in">
          <div className="section-eyebrow">Assistant</div>
          <h2>Meet John</h2>
          <p className="section-sub">
            John is an agent orchestrator who delegates to two specialists &mdash; one that calls places to book
            appointments, one that drafts Gmail replies &mdash; and never books or sends anything without your
            approval. This runs as a safe simulated demo by default; connect it to a real deployed backend below.
          </p>
        </div>

        <div className="lab-controls fade-in">
          <button className="btn btn-ghost btn-sm" onClick={() => setSettingsOpen((o) => !o)}>
            {connection ? 'Live assistant: on' : 'Live assistant: off (demo)'}
          </button>
        </div>

        {settingsOpen && (
          <AssistantSettings connection={connection} onSave={saveConnection} onClear={clearConnection} onClose={() => setSettingsOpen(false)} />
        )}

        <div className="lab-grid fade-in">
          <div className="assistant-chat-frame">
            <div className="assistant-chat-messages">
              {messages.length === 0 && (
                <div className="assistant-empty">
                  <p>Ask John to schedule something or check your email.</p>
                  <div className="assistant-suggestions">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} className="pack-file-btn" onClick={() => handleSend(s)} disabled={sending}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`assistant-bubble-row assistant-bubble-row--${m.role}`}>
                  <div className={`assistant-bubble assistant-bubble--${m.role}`}>{m.content}</div>
                </div>
              ))}
              {sending && (
                <div className="assistant-bubble-row assistant-bubble-row--assistant">
                  <div className="assistant-bubble assistant-bubble--assistant assistant-bubble--typing">
                    <span className="spinner" /> John is thinking…
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {pendingApproval && (
              <div className="assistant-approval-card">
                <div className="assistant-approval-kind">
                  {pendingApproval.kind === 'scheduling' ? 'Booking approval needed' : 'Email reply approval needed'}
                </div>
                <pre className="assistant-approval-summary">{pendingApproval.summary}</pre>
                <div className="bedrock-settings-actions">
                  <button className="btn btn-primary btn-sm" disabled={resolving} onClick={() => handleApprove(true)}>
                    Approve
                  </button>
                  <button className="btn btn-ghost btn-sm" disabled={resolving} onClick={() => handleApprove(false)}>
                    Deny
                  </button>
                </div>
              </div>
            )}

            <form
              className="assistant-input-row"
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message John…"
                disabled={sending}
              />
              <button type="submit" className="btn btn-primary btn-sm" disabled={sending || !input.trim()}>
                Send
              </button>
            </form>
          </div>

          <div className="lab-visual-frame">
            <div style={{ width: '100%' }}>
              <OrchestratorVisual
                agentNames={SUB_AGENT_NAMES}
                statuses={statuses}
                orchestratorLabel="John"
                orchestratorKey="John"
              />
              <div className="agent-log" ref={logRef}>
                {events.length === 0 && <p className="agent-log-empty">Agent activity will appear here once you message John.</p>}
                {events.map((e) => (
                  <div key={e.id} className={`agent-log-line agent-log-line--${e.kind}`}>
                    <span className="agent-log-agent">{e.agent}</span>
                    <span>{e.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
