import { useState, type FormEvent } from 'react'
import type { AssistantConnection } from '../../lib/assistantConfig'

export function AssistantSettings({
  connection,
  onSave,
  onClear,
  onClose,
}: {
  connection: AssistantConnection | null
  onSave: (conn: AssistantConnection) => void
  onClear: () => void
  onClose: () => void
}) {
  const [apiBaseUrl, setApiBaseUrl] = useState(connection?.apiBaseUrl ?? '')
  const [token, setToken] = useState(connection?.token ?? '')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!apiBaseUrl || !token) return
    onSave({ apiBaseUrl, token })
    onClose()
  }

  return (
    <div className="bedrock-settings fade-in">
      <p className="bedrock-settings-note">
        Optional: connect this tab to a real, deployed John orchestrator (the <code>Assistant</code> repo on my
        GitHub) instead of the built-in demo. Paste the API base URL and token from that deployment&apos;s
        <code> infra/SECRETS.md</code> setup. Kept in <code>sessionStorage</code> only &mdash; never sent anywhere
        but that API, never persisted after this tab closes. Without this, everything below runs as a safe, fully
        simulated demo.
      </p>
      <form onSubmit={handleSubmit} className="bedrock-settings-form">
        <input
          value={apiBaseUrl}
          onChange={(e) => setApiBaseUrl(e.target.value)}
          placeholder="https://xxxx.execute-api.us-east-1.amazonaws.com/prod"
          required
        />
        <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Assistant API token" type="password" required />
        <div className="bedrock-settings-actions">
          <button type="submit" className="btn btn-primary btn-sm">Connect</button>
          {connection && <button type="button" className="btn btn-ghost btn-sm" onClick={onClear}>Disconnect</button>}
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
