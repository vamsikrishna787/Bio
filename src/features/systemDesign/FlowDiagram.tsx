import { RobotIcon } from '../../components/RobotIcon'

export interface DiagramNode {
  id: string
  x: number
  y: number
  w: number
  h: number
  label: string
  sublabel?: string
  variant?: 'default' | 'accent' | 'store'
  icon?: 'robot'
}

export interface DiagramEdge {
  from: string
  to: string
  label?: string
}

interface Point {
  x: number
  y: number
}

function borderPoint(node: DiagramNode, towardX: number, towardY: number): Point {
  const dx = towardX - node.x
  const dy = towardY - node.y
  if (dx === 0 && dy === 0) return { x: node.x, y: node.y }
  const halfW = node.w / 2
  const halfH = node.h / 2
  const scaleX = dx !== 0 ? halfW / Math.abs(dx) : Infinity
  const scaleY = dy !== 0 ? halfH / Math.abs(dy) : Infinity
  const scale = Math.min(scaleX, scaleY, 1)
  return { x: node.x + dx * scale, y: node.y + dy * scale }
}

export function FlowDiagram({
  nodes,
  edges,
  width = 760,
  height = 360,
}: {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  width?: number
  height?: number
}) {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]))

  return (
    <svg
      className="flow-diagram"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="System architecture diagram"
    >
      <defs>
        <marker id="fd-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" fill="var(--accent)" />
        </marker>
      </defs>

      {edges.map((edge, i) => {
        const from = byId[edge.from]
        const to = byId[edge.to]
        if (!from || !to) return null
        const p1 = borderPoint(from, to.x, to.y)
        const p2 = borderPoint(to, from.x, from.y)
        const midX = (p1.x + p2.x) / 2
        const midY = (p1.y + p2.y) / 2
        return (
          <g key={`${edge.from}-${edge.to}-${i}`}>
            <path
              d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`}
              className="flow-edge"
              markerEnd="url(#fd-arrow)"
            />
            {edge.label && (
              <text x={midX} y={midY - 8} textAnchor="middle" className="flow-edge-label">
                {edge.label}
              </text>
            )}
          </g>
        )
      })}

      {nodes.map((node) => (
        <g key={node.id} transform={`translate(${node.x - node.w / 2}, ${node.y - node.h / 2})`}>
          <rect
            width={node.w}
            height={node.h}
            rx={14}
            className={`flow-node flow-node--${node.variant ?? 'default'}`}
          />
          {node.icon === 'robot' ? (
            <>
              <RobotIcon x={12} y={node.h / 2 - 9} />
              <text x={38} y={node.h / 2 + 5} textAnchor="start" className="flow-node-label">
                {node.label}
              </text>
            </>
          ) : (
            <text x={node.w / 2} y={node.h / 2 + (node.sublabel ? -4 : 5)} textAnchor="middle" className="flow-node-label">
              {node.label}
            </text>
          )}
          {node.sublabel && (
            <text x={node.w / 2} y={node.h / 2 + 14} textAnchor="middle" className="flow-node-sublabel">
              {node.sublabel}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}
