interface TypingIndicatorProps {
  agentName?: string
}

const AGENT_COLOR: Record<string, string> = {
  NEXUS:      '#7c3aed',
  ALEX:       '#059669',
  VORTEX:     '#a78bfa',
  RESEARCHER: '#f97316',
}

export function TypingIndicator({ agentName = 'NEXUS' }: TypingIndicatorProps) {
  const color = AGENT_COLOR[agentName] ?? '#7c3aed'

  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-fade-in">
      {/* Agent dot */}
      <div
        className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
        style={{ background: color }}
      >
        {agentName[0]}
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium" style={{ color }}>{agentName}</span>
        {/* Three bouncing dots */}
        <div className="flex items-center gap-1">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{
                background: color,
                animation: `typingDot 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
                opacity: 0.3,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
