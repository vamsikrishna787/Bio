import { useEffect } from 'react'
import { profileImageBase64 } from './profileImage'

function App() {
  useEffect(() => {
    // Scroll-triggered fade-ins
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

    // Subtle click sound (synthesized, no external audio file)
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
      io?.disconnect()
    }
  }, [])

  return (
    <>
      <header>
        <nav>
          <a href="#top" className="brand">Vamsi Bollepalli</a>
          <ul className="nav-links">
            <li><a href="#about">About</a></li>
            <li><a href="#skills">Skills</a></li>
            <li><a href="#experience">Experience</a></li>
            <li><a href="#certifications">Certifications</a></li>
            <li><a href="https://github.com/vamsikrishna787" target="_blank" rel="noopener">GitHub</a></li>
            <li><a href="https://www.linkedin.com/in/vamsibollepalli/" target="_blank" rel="noopener" className="nav-cta">LinkedIn</a></li>
          </ul>
        </nav>
      </header>

      <div id="top">
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
              <a href="#experience" className="btn btn-ghost">View Experience</a>
            </div>
          </div>
        </section>

        <section id="about" className="tight">
          <div className="wrap">
            <div className="section-head fade-in">
              <div className="section-eyebrow">About</div>
              <h2>Building at the intersection<br />of cloud and AI</h2>
            </div>
            <div className="about-body fade-in">
              <p>I'm a software engineer with <strong>11 years of experience</strong> designing and building web applications on public cloud platforms, using modern JavaScript frameworks and robust backend architectures.</p>
              <p>More recently, my focus has shifted toward <strong>solving real business problems with agentic AI</strong> — building solutions using MCP, RAG pipelines, and autonomous agents that connect cloud infrastructure with practical, intelligent workflows.</p>
            </div>
            <div className="pill-row fade-in">
              <span className="pill">Cloud Architecture</span>
              <span className="pill">Modern JavaScript</span>
              <span className="pill">Backend Systems</span>
              <span className="pill">Agentic AI</span>
              <span className="pill">MCP</span>
              <span className="pill">RAG</span>
            </div>
          </div>
        </section>

        <section id="skills" className="tight" style={{ background: 'var(--bg-soft)' }}>
          <div className="wrap">
            <div className="section-head fade-in">
              <div className="section-eyebrow">Expertise</div>
              <h2>What I work with</h2>
            </div>
            <div className="skills-grid">
              <div className="skill-card fade-in">
                <div className="icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="1.8"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h.79a4.5 4.5 0 1 1 0 9Z"/></svg></div>
                <h3>Public Cloud</h3>
                <p>Designing and deploying scalable, production-grade infrastructure on AWS.</p>
              </div>
              <div className="skill-card fade-in">
                <div className="icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="1.8"><path d="m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16"/></svg></div>
                <h3>Modern JavaScript</h3>
                <p>Building responsive, high-performance web applications end to end.</p>
              </div>
              <div className="skill-card fade-in">
                <div className="icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg></div>
                <h3>Backend Solutions</h3>
                <p>Architecting reliable APIs and services that scale with business needs.</p>
              </div>
              <div className="skill-card fade-in">
                <div className="icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="#1d1d1f" stroke="none"><path d="m12 2.5 1.9 5.32a3 3 0 0 0 1.83 1.83L21.5 12l-5.77 2.35a3 3 0 0 0-1.83 1.83L12 21.5l-1.9-5.32a3 3 0 0 0-1.83-1.83L2.5 12l5.77-2.35a3 3 0 0 0 1.83-1.83Z"/></svg></div>
                <h3>Agentic AI</h3>
                <p>Designing autonomous agent workflows that solve real business problems.</p>
              </div>
              <div className="skill-card fade-in">
                <div className="icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8Z"/><path d="M12 18v4"/></svg></div>
                <h3>MCP &amp; Tool Integration</h3>
                <p>Connecting models to real systems using the Model Context Protocol.</p>
              </div>
              <div className="skill-card fade-in">
                <div className="icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg></div>
                <h3>RAG Pipelines</h3>
                <p>Building retrieval-augmented systems that ground AI in real data.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="experience" className="tight">
          <div className="wrap">
            <div className="section-head fade-in">
              <div className="section-eyebrow">Experience</div>
              <h2>Career &amp; education</h2>
            </div>
            <div className="timeline fade-in">
              <div className="timeline-item">
                <div className="timeline-date">Current</div>
                <div className="timeline-content">
                  <h3>Senior Associate, Software Engineer</h3>
                  <div className="org">JPMorgan Chase &amp; Co.</div>
                  <p>Building cloud-based web applications and exploring agentic AI solutions to modernize business workflows.</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-date">Education</div>
                <div className="timeline-content">
                  <h3>Murray State University</h3>
                  <div className="org">Degree</div>
                  <p>Foundation in computer science and engineering principles.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="certifications" className="tight" style={{ background: 'var(--bg-soft)' }}>
          <div className="wrap">
            <div className="section-head fade-in">
              <div className="section-eyebrow">Certifications</div>
              <h2>AWS credentials</h2>
            </div>
            <div className="cert-grid fade-in">
              <div className="cert-card">
                <div className="badge">AWS</div>
                <div>
                  <h3>AWS Certified Solutions Architect – Associate</h3>
                  <p>Amazon Web Services Training and Certification</p>
                </div>
              </div>
              <div className="cert-card">
                <div className="badge">AWS</div>
                <div>
                  <h3>AWS Certified Developer – Associate</h3>
                  <p>Amazon Web Services Training and Certification</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="tight">
          <div className="wrap">
            <div className="contact-card fade-in">
              <h2>Let's connect</h2>
              <p>This site is where I maintain my work, projects, and updates. Follow along or reach out on LinkedIn or GitHub.</p>
              <div className="hero-actions">
                <a href="https://www.linkedin.com/in/vamsibollepalli/" target="_blank" rel="noopener" className="btn btn-primary">Message on LinkedIn</a>
                <a href="https://github.com/vamsikrishna787" target="_blank" rel="noopener" className="btn btn-ghost">View GitHub</a>
              </div>
            </div>
          </div>
        </section>

        <footer>
          &copy; 2026 Vamsi Krishna Bollepalli &middot; Plano, Texas
        </footer>
      </div>
    </>
  )
}

export default App
