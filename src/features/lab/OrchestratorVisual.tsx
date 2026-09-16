import { RobotIcon } from '../../components/RobotIcon'

export type AgentStatus = 'idle' | 'active' | 'done' | 'error'

export function OrchestratorVisual({
  agentNames,
  statuses,
}: {
  agentNames: string[]
  statuses: Record<string, AgentStatus>
}) {
  const width = 880
  const height = 220
  const orchestrator = { x: width / 2, y: 50 }
  const spacing = width / (agentNames.length + 1)
  const subAgents = agentNames.map((name, i) => ({ name, x: spacing * (i + 1), y: 172 }))

  const statusOf = (name: string): AgentStatus => statuses[name] ?? 'idle'

  return (
    <svg className="lab-orchestrator" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Orchestrator and sub-agents">
      {subAgents.map((a) => (
        <line
          key={a.name}
          x1={orchestrator.x}
          y1={orchestrator.y + 22}
          x2={a.x}
          y2={a.y - 22}
          className={`lab-edge lab-edge--${statusOf(a.name)}`}
        />
      ))}

      <g transform={`translate(${orchestrator.x - 105}, ${orchestrator.y - 22})`}>
        <rect width={210} height={44} rx={12} className={`lab-node lab-node--${statusOf('Orchestrator')}`} />
        <RobotIcon x={12} y={6} size={20} />
        <text x={40} y={27} textAnchor="start" className="lab-node-label">Orchestrator Agent</text>
      </g>

      {subAgents.map((a) => (
        <g key={a.name} transform={`translate(${a.x - 80}, ${a.y - 22})`}>
          <rect width={160} height={44} rx={12} className={`lab-node lab-node--${statusOf(a.name)}`} />
          <RobotIcon x={10} y={6} size={18} />
          <text x={36} y={27} textAnchor="start" className="lab-node-label">{a.name}</text>
        </g>
      ))}
    </svg>
  )
}
