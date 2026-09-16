export function RobotIcon({ x, y, size = 18 }: { x: number; y: number; size?: number }) {
  const s = size / 24
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`} className="robot-icon">
      <rect x="4" y="9" width="16" height="12" rx="4" />
      <path d="M12 9V6" />
      <circle cx="12" cy="4.3" r="1.5" className="robot-icon-solid" />
      <path d="M4 14.5H1.2" />
      <path d="M22.8 14.5H20" />
      <circle cx="9.4" cy="15" r="1.5" className="robot-icon-solid" />
      <circle cx="14.6" cy="15" r="1.5" className="robot-icon-solid" />
    </g>
  )
}
