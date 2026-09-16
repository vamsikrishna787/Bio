import { useEffect, useState } from 'react'
import { profileImageBase64 } from './profileImage'
import { AboutTab } from './tabs/AboutTab'
import { MarketplaceTab } from './tabs/MarketplaceTab'
import { SystemDesignTab } from './tabs/SystemDesignTab'
import { LabTab } from './tabs/LabTab'
import { AssistantTab } from './tabs/AssistantTab'

const TABS = [
  { id: 'about', label: 'About' },
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'system-design', label: 'System Design' },
  { id: 'lab', label: 'Lab' },
  { id: 'assistant', label: 'Assistant' },
] as const

type TabId = (typeof TABS)[number]['id']

const TAB_PATHS: Record<TabId, string> = {
  about: '/',
  marketplace: '/marketplace',
  'system-design': '/system-design',
  lab: '/lab',
  assistant: '/assistant',
}

function getTabFromPath(pathname: string): TabId {
  const entry = Object.entries(TAB_PATHS).find(([, path]) => path === pathname)
  return (entry?.[0] as TabId | undefined) ?? 'about'
}

function App() {
  const [activeTab, setActiveTab] = useState<TabId>(() => getTabFromPath(window.location.pathname))

  useEffect(() => {
    function onPopState() {
      setActiveTab(getTabFromPath(window.location.pathname))
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  function selectTab(id: TabId) {
    const path = TAB_PATHS[id]
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path)
    }
    setActiveTab(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Scroll-triggered fade-ins — re-run whenever the active tab's content changes.
  useEffect(() => {
    const els = document.querySelectorAll('.fade-in')
    let io: IntersectionObserver | null = null
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible')
              io?.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.15 },
      )
      els.forEach((el) => io?.observe(el))
    } else {
      els.forEach((el) => el.classList.add('visible'))
    }
    return () => io?.disconnect()
  }, [activeTab])

  // Subtle click sound (synthesized, no external audio file)
  useEffect(() => {
    let audioCtx: AudioContext | null = null
    function getCtx() {
      if (!audioCtx) {
        const AC = window.AudioContext || (window as any).webkitAudioContext
        if (AC) audioCtx = new AC()
      }
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume()
      return audioCtx
    }
    function playClick(kind: 'primary' | 'secondary') {
      const ctx = getCtx()
      if (!ctx) return
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      filter.type = 'bandpass'
      filter.Q.value = 1.4
      const freq = kind === 'primary' ? 1500 : 1100
      const peak = kind === 'primary' ? 0.045 : 0.028
      filter.frequency.setValueAtTime(freq, now)
      osc.frequency.setValueAtTime(freq, now)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(peak, now + 0.002)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032)
      osc.start(now)
      osc.stop(now + 0.035)
    }
    function onClick(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest('a, button')
      if (!target) return
      playClick(
        target.classList.contains('btn-primary') || target.classList.contains('nav-cta')
          ? 'primary'
          : 'secondary',
      )
    }
    document.addEventListener('click', onClick, true)

    return () => {
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  return (
    <>
      <header>
        <nav>
          <button type="button" className="brand" onClick={() => selectTab('about')}>Vamsi Bollepalli</button>
          <ul className="nav-links">
            {TABS.map((tab) => (
              <li key={tab.id}>
                <button
                  type="button"
                  className={`nav-tab${activeTab === tab.id ? ' active' : ''}`}
                  onClick={() => selectTab(tab.id)}
                >
                  {tab.label}
                </button>
              </li>
            ))}
            <li><a href="https://github.com/vamsikrishna787" target="_blank" rel="noopener">GitHub</a></li>
            <li><a href="https://www.linkedin.com/in/vamsibollepalli/" target="_blank" rel="noopener" className="nav-cta">LinkedIn</a></li>
          </ul>
        </nav>
      </header>

      <div id="top">
        {activeTab === 'about' && (
          <section className="hero">
            <div className="wrap">
              <div className="avatar-wrap">
                <img src={profileImageBase64} alt="Vamsi Krishna Bollepalli" />
              </div>
              <div className="eyebrow">Software Engineer &amp; Cloud Architect</div>
              <h1>Vamsi Krishna Bollepalli</h1>
              <p className="role">Senior Software Engineer at <strong>JPMorgan Chase &amp; Co.</strong> &middot; Plano, TX</p>
              <p className="summary">11+ years building cloud-native web applications with modern JavaScript and backend systems — now focused on solving real business problems with agentic AI, MCP, and RAG.</p>
              <div className="hero-actions">
                <a href="https://www.linkedin.com/in/vamsibollepalli/" target="_blank" rel="noopener" className="btn btn-primary">Connect on LinkedIn</a>
                <a href="https://github.com/vamsikrishna787" target="_blank" rel="noopener" className="btn btn-ghost">View GitHub</a>
              </div>
            </div>
          </section>
        )}

        <main>
          {activeTab === 'about' && <AboutTab />}
          {activeTab === 'marketplace' && <MarketplaceTab />}
          {activeTab === 'system-design' && <SystemDesignTab />}
          {activeTab === 'lab' && <LabTab />}
          {activeTab === 'assistant' && <AssistantTab />}
        </main>

        <footer>
          &copy; 2026 Vamsi Krishna Bollepalli &middot; Plano, Texas
        </footer>
      </div>
    </>
  )
}

export default App
