/**
 * AgentSidebar — Phase 2.
 * Active agent card pulses when streaming (shows handoff visually).
 */
import { AGENTS } from '@/types'
import type { AgentName } from '@/types'
import { useAppStore } from '@/store/useAppStore'
import { PixelHead }   from '@/components/ui/PixelHead'
import { McBar }         from '@/components/ui/McBar'
import { getStatusIndicator } from '@/constants/assets'
import { SessionHistory } from '@/components/chat/SessionHistory'
import { TemplatesPanel } from '@/components/chat/TemplatesPanel'

const ABILITIES = [
  { label: 'WEB SEARCH', on: true  },
  { label: 'CODE EXEC',  on: true  },
  { label: 'RAG QUERY',  on: true  },
  { label: 'SQL AGENT',  on: true,  isNew: true },
  { label: 'VISION',     on: false },
  { label: 'VOICE',      on: false },
]

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`font-pixel text-[6px] text-chat-sys px-2 py-1.5 border-b border-chat-sys/20 drop-shadow-[1px_1px_0_#000] ${className}`}>
      {children}
    </div>
  )
}

function Chip({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className="font-pixel text-[4px] px-1 py-px border border-current" style={{ color }}>
      {children}
    </span>
  )
}

export function AgentSidebar() {
  const { activeAgent, setActiveAgent, isStreaming, insertIntoInput } = useAppStore()

  return (
    <aside className="bg-[rgba(0,0,0,0.72)] border-r-[3px] border-black/60 overflow-y-auto flex flex-col select-none" style={{ scrollbarWidth: 'none' }}>
      <Label>▶ PARTY MEMBERS</Label>

      {(Object.keys(AGENTS) as AgentName[]).map(name => {
        const agent    = AGENTS[name]
        const isActive = activeAgent === name
        const isPulsing = isActive && isStreaming

        return (
          <button key={name} onClick={() => { if (!isStreaming) setActiveAgent(name) }}
            disabled={isStreaming}
            className={[
              'w-full text-left px-2 py-2 border-b-2 border-black/40 focus:outline-none',
              isActive ? 'bg-[rgba(100,200,100,0.15)] border-l-[3px] border-l-[#5d9e32]' : 'hover:bg-white/8',
              isPulsing ? 'animate-pulse' : '',
              isStreaming ? 'cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
            aria-pressed={isActive}>
            <div className="flex gap-2 items-start">
              <div className="relative flex-shrink-0">
                <PixelHead agent={name} size={32} />
                <img
                  src={getStatusIndicator('online')}
                  alt="online"
                  width={12}
                  height={12}
                  className="absolute bottom-0 right-0"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-pixel text-[6px] text-white drop-shadow-[1px_1px_0_#000] mb-1">
                  {name}
                  {isActive && <span className="ml-1 text-[#6abf38]">◀</span>}
                  {isPulsing && <span className="ml-1 text-yellow-300 animate-[blink_0.5s_steps(1)_infinite]">▶</span>}
                </div>
                <div className="font-pixel text-[5px] text-chat-agent drop-shadow-[1px_1px_0_#000]">{agent.role}</div>
                <div className="mt-1 flex gap-1 items-center">
                  <span className="font-pixel text-[4px] text-white/50">HP</span>
                  <McBar value={agent.hp} variant="hp" className="flex-1" />
                </div>
                <div className="mt-0.5 flex gap-1 items-center">
                  <span className="font-pixel text-[4px] text-white/50">MP</span>
                  <McBar value={agent.mp} variant="mp" className="flex-1" />
                </div>
                <div className="flex gap-1 mt-1 flex-wrap">
                  <Chip color="#e02020">HP {agent.hp}</Chip>
                  <Chip color="#3050c0">MP {agent.mp}</Chip>
                  <Chip color="#f5c842">LV {agent.level}</Chip>
                </div>
              </div>
            </div>
          </button>
        )
      })}

      <Label className="mt-1">▶ ABILITIES</Label>
      <div className="px-2 py-1 font-pixel text-[5px] leading-[2.5]">
        {ABILITIES.map(({ label, on, isNew }) => (
          <div key={label} className="flex items-center gap-1">
            <span className={on ? 'text-chat-agent' : 'text-white/30'}>{on ? '⚡' : '○'}</span>
            <span className={on ? 'text-chat-agent' : 'text-white/30'}>{label}</span>
            {isNew && <span className="text-[4px] text-[#6abf38] ml-0.5">[NEW]</span>}
          </div>
        ))}
      </div>

      <Label className="mt-1">▶ BIOME</Label>
      <div className="font-pixel text-[5px] leading-[2.5] px-2 py-1">
        <div className="text-[#6abf38]">🌲 FOREST DIMENSION</div>
        <div className="text-white/40">Difficulty: HARD</div>
        <div className="text-yellow-300">Moon Phase: 🌕</div>
      </div>

      {/* Panels at the bottom of the sidebar */}
      <div className="mt-auto">
        <TemplatesPanel onSelectTemplate={insertIntoInput} />
        <SessionHistory />
      </div>
    </aside>
  )
}
