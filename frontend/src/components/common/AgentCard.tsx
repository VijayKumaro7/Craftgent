/**
 * AgentCard — reusable agent profile card for showcase
 */
interface AgentCardProps {
  name: string
  role: string
  description: string
  imageSrc: string
  color: string
  abilities: string[]
}

export function AgentCard({ name, role, description, imageSrc, color, abilities }: AgentCardProps) {
  return (
    <div
      className="overflow-hidden bg-[rgba(0,0,0,0.72)] border-3 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
      style={{
        borderColor: color,
        boxShadow: '3px 3px 0 rgba(0,0,0,0.8)',
      }}
    >
      {/* Agent Image */}
      <div className="w-full aspect-square overflow-hidden bg-[#0a0e27] border-b-3 flex items-center justify-center" style={{ borderColor: color }}>
        <img
          src={imageSrc}
          alt={name}
          className="w-full h-full object-cover"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {/* Agent Info */}
      <div className="p-4">
        <h3 className="font-pixel text-[10px] text-white mb-1" style={{ color, textShadow: '2px 2px 0 rgba(0,0,0,0.8)' }}>
          {name}
        </h3>
        <p className="font-pixel text-[6px] text-[#ffff55] mb-3 uppercase">{role}</p>
        <p className="font-terminal text-[7px] text-[#aaffaa] mb-4 leading-relaxed h-[60px] overflow-hidden">{description}</p>

        {/* Abilities */}
        <div className="flex flex-wrap gap-2 mb-3">
          {abilities.map((ability, idx) => (
            <span
              key={idx}
              className="font-pixel text-[6px] px-2 py-1 border border-current"
              style={{ color, textShadow: '1px 1px 0 rgba(0,0,0,0.8)' }}
            >
              {ability}
            </span>
          ))}
        </div>

        {/* Stats bars (visual indicator) */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[6px] text-[#e02020] w-8">HP</span>
            <div className="flex-1 h-2 bg-[#1a1a2e] border border-[#e02020]">
              <div className="h-full bg-[#e02020] w-4/5" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[6px] text-[#55ffff] w-8">MP</span>
            <div className="flex-1 h-2 bg-[#1a1a2e] border border-[#55ffff]">
              <div className="h-full bg-[#55ffff] w-3/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
