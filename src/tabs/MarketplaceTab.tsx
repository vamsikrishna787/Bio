import { useEffect, useState } from 'react'
import { marketplacePacks, type MarketplacePack } from '../data/marketplace'
import { getDownloadCount, recordDownload } from '../lib/marketplaceStore'
import { GmailConnectModal } from '../features/marketplace/GmailConnectModal'

function connectedKey(packId: string) {
  return `marketplace:${packId}:connected`
}

function PackCard({ pack }: { pack: MarketplacePack }) {
  const [downloads, setDownloads] = useState<number | null>(null)
  const [connected, setConnected] = useState(() => {
    try {
      return localStorage.getItem(connectedKey(pack.id)) === 'true'
    } catch {
      return false
    }
  })
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    getDownloadCount(pack.id, pack.seedDownloads).then(setDownloads)
  }, [pack.id, pack.seedDownloads])

  async function handleDownload(path: string) {
    const link = document.createElement('a')
    link.href = path
    link.download = ''
    document.body.appendChild(link)
    link.click()
    link.remove()
    setDownloads(await recordDownload(pack.id, pack.seedDownloads))
  }

  function persistConnected(value: boolean) {
    setConnected(value)
    try {
      localStorage.setItem(connectedKey(pack.id), String(value))
    } catch {
      // ignore
    }
  }

  return (
    <div className="pack-card fade-in">
      <div className="pack-card-top">
        <span className={`pack-category pack-category--${pack.category.toLowerCase()}`}>{pack.category}</span>
        <span className="pack-version">v{pack.version}</span>
      </div>
      <h3>{pack.name}</h3>
      <p className="pack-tagline">{pack.tagline}</p>
      <p className="pack-description">{pack.description}</p>

      <div className="pack-files">
        {pack.files.map((file) => (
          <button key={file.path} className="pack-file-btn" onClick={() => handleDownload(file.path)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 4v11m0 0 4-4m-4 4-4-4M4 19h16"/></svg>
            {file.label}
          </button>
        ))}
      </div>

      <div className="pack-card-footer">
        <span className="pack-downloads">{downloads === null ? '…' : downloads.toLocaleString()} downloads</span>
        {pack.connect === 'gmail-demo' && (
          <button className={`btn btn-sm ${connected ? 'btn-ghost' : 'btn-primary'}`} onClick={() => setModalOpen(true)}>
            {connected ? 'Connected' : 'Connect Gmail'}
          </button>
        )}
      </div>

      {modalOpen && (
        <GmailConnectModal
          connected={connected}
          onClose={() => setModalOpen(false)}
          onConnected={() => persistConnected(true)}
          onDisconnect={() => persistConnected(false)}
        />
      )}
    </div>
  )
}

export function MarketplaceTab() {
  return (
    <section className="tight">
      <div className="wrap">
        <div className="section-head fade-in">
          <div className="section-eyebrow">Marketplace</div>
          <h2>Agents &amp; skills</h2>
          <p className="section-sub">Downloadable agent + skill packs for specific tasks. Download counts are shared across visitors.</p>
        </div>
        <div className="pack-grid">
          {marketplacePacks.map((pack) => (
            <PackCard key={pack.id} pack={pack} />
          ))}
          <div className="pack-card pack-card--coming-soon fade-in">
            <h3>More packs coming soon</h3>
            <p className="pack-description">Calendar, Slack, and internal-API skill packs are next up.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
