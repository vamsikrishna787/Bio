// BYO connection to a real, deployed John orchestrator (see the sibling
// `Assistant` repo). Same philosophy as awsConfig.ts's Bedrock credentials:
// entered by a visitor at runtime, kept in sessionStorage only — never
// bundled, never committed, cleared when the tab closes. Without it, the
// Assistant tab runs a fully simulated demo (see assistantOrchestrator.ts).

export interface AssistantConnection {
  apiBaseUrl: string
  token: string
}

const ASSISTANT_CONN_KEY = 'assistant:connection'
const ASSISTANT_SESSION_KEY = 'assistant:session-id'

export function getAssistantConnection(): AssistantConnection | null {
  try {
    const raw = sessionStorage.getItem(ASSISTANT_CONN_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setAssistantConnection(conn: AssistantConnection | null) {
  try {
    if (conn) sessionStorage.setItem(ASSISTANT_CONN_KEY, JSON.stringify(conn))
    else sessionStorage.removeItem(ASSISTANT_CONN_KEY)
  } catch {
    // sessionStorage unavailable (private browsing etc.) — live mode just stays off
  }
}

export function isAssistantLiveConfigured(): boolean {
  return getAssistantConnection() !== null
}

// A stable per-tab session id so John's conversation memory (DynamoDB-backed
// on the live backend) survives re-renders and page navigations within a tab.
export function getOrCreateSessionId(): string {
  try {
    let id = sessionStorage.getItem(ASSISTANT_SESSION_KEY)
    if (!id) {
      id = `web_${crypto.randomUUID().slice(0, 12)}`
      sessionStorage.setItem(ASSISTANT_SESSION_KEY, id)
    }
    return id
  } catch {
    return `web_${Math.random().toString(36).slice(2, 12)}`
  }
}
