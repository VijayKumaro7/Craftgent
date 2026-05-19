interface AgentCardProps {
  name: string
  role: string
  description: string
  imageSrc: string
  color: string
  abilities: string[]
}

export function AgentCard({ name, role, description, color, abilities }: AgentCardProps) {
  return (
    <div
      className="glass-card rounded-xl overflow-hidden group transition-all duration-300 hover:-translate-y-2 hover:shadow-card-hover"
      style={{ borderColor: `${color}25` }}
    >
      {/* Color bar accent */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

      {/* Agent identity */}
      <div className="p-5">
        {/* Icon placeholder */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          {name === 'NEXUS' ? '🧠' : name === 'ALEX' ? '⚡' : name === 'VORTEX' ? '🌀' : '🔬'}
        </div>

        <h3 className="font-bold text-lg text-text-primary mb-0.5" style={{ color }}>
          {name}
        </h3>
        <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: `${color}aa` }}>
          {role}
        </p>
        <p className="text-text-secondary text-sm leading-relaxed mb-4 line-clamp-3">
          {description}
        </p>

        {/* Abilities */}
        <div className="flex flex-wrap gap-1.5">
          {abilities.map((ability, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: `${color}15`,
                border: `1px solid ${color}30`,
                color,
              }}
            >
              {ability}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
