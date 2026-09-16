import { systemDesigns } from '../data/systemDesigns'
import { FlowDiagram } from '../features/systemDesign/FlowDiagram'

export function SystemDesignTab() {
  return (
    <section className="tight">
      <div className="wrap">
        <div className="section-head fade-in">
          <div className="section-eyebrow">System Design</div>
          <h2>Designing with AI</h2>
          <p className="section-sub">Architecture patterns for building with agents, retrieval, and MCP &mdash; each shown as a live diagram.</p>
        </div>
        <div className="system-design-list">
          {systemDesigns.map((system) => (
            <div key={system.id} className="system-card fade-in">
              <h3>{system.title}</h3>
              <p className="system-summary">{system.summary}</p>
              <div className="diagram-frame">
                <FlowDiagram nodes={system.nodes} edges={system.edges} width={system.width} height={system.height} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
