import { useState } from 'react'

type ConnectState = 'idle' | 'connecting' | 'connected'

export function GmailConnectModal({
  connected,
  onClose,
  onConnected,
  onDisconnect,
}: {
  connected: boolean
  onClose: () => void
  onConnected: () => void
  onDisconnect: () => void
}) {
  const [state, setState] = useState<ConnectState>(connected ? 'connected' : 'idle')

  function simulateConnect() {
    setState('connecting')
    setTimeout(() => {
      setState('connected')
      onConnected()
    }, 1400)
  }

  function disconnect() {
    setState('idle')
    onDisconnect()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        <div className="modal-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="1.6"><path d="M3 6.5 12 13l9-6.5M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/></svg>
        </div>
        <h3>Connect Gmail</h3>
        <p className="modal-demo-badge">Demo mode &mdash; no real Gmail account is accessed</p>

        {state === 'idle' && (
          <>
            <p className="modal-copy">This simulates the OAuth consent screen a real Gmail MCP connection would show, so you can preview the flow without granting access to an actual inbox.</p>
            <button className="btn btn-primary" onClick={simulateConnect}>Continue with Google (demo)</button>
          </>
        )}
        {state === 'connecting' && (
          <div className="modal-connecting">
            <span className="spinner" />
            <span>Connecting to Gmail&hellip;</span>
          </div>
        )}
        {state === 'connected' && (
          <>
            <p className="modal-copy">Connected as <strong>demo@example.com</strong>. In a real deployment this agent would now be able to search, summarize, and draft replies through the Gmail MCP server.</p>
            <button className="btn btn-ghost" onClick={disconnect}>Disconnect</button>
          </>
        )}
      </div>
    </div>
  )
}
