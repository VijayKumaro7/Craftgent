/**
 * TaskPanel — Phase 3. Live XP from API, animated bars.
 */
import { useEffect } from 'react'
import { useAppStore }   from '@/store/useAppStore'
import { useAgentStats } from '@/hooks/useAgentStats'
import { McBar }         from '@/components/ui/McBar'
import { AGENTS }        from '@/types'

function SectionLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`font-pixel text-[6px] text-chat-sys px-2 py-1.5 border-b border-chat-sys/20 drop-shadow-[1px_1px_0_#000] ${className}`}>{children}</div>
}
function StatusDot({ status }: { status: string }) {
  const color = { done: 'text-[#5aff5a]', running: 'text-yellow-300 animate-pulse', queued: 'text-white/30' } as Record<string,string>
  const icon  = { done: '■', running: '▶', queued: '◌' } as Record<string,string>
  return <span className={`font-pixel text-[6px] ${color[status] ?? ''} flex-shrink-0`}>{icon[status] ?? '○'}</span>
}

export function TaskPanel() {
  const { tasks, updateTaskProgress, inventory, activeAgent } = useAppStore()
  const { data: statsData } = useAgentStats()
  const staticAgent = AGENTS[activeAgent]
  const live        = statsData?.stats?.[activeAgent]
  const hp        = live?.hp          ?? staticAgent.hp
  const mp        = live?.mp          ?? staticAgent.mp
  const level     = live?.level       ?? staticAgent.level
  const xpPct     = live?.xp_percent  ?? staticAgent.xp
  const msgCount  = live?.message_count ?? 0

  useEffect(() => {
    const running = tasks.find(t => t.status === 'running')
    if (!running) return
    let v = running.progress
    const id = setInterval(() => {
      v = Math.min(100, v + Math.random() * 3)
      updateTaskProgress(running.id, Math.round(v))
      if (v >= 100) clearInterval(id)
    }, 600)
    return () => clearInterval(id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <aside className="bg-[rgba(0,0,0,0.72)] border-l-[3px] border-black/60 overflow-y-auto flex flex-col" style={{ scrollbarWidth: 'none' }}>
      <SectionLabel>▶ INVENTORY</SectionLabel>
      <div className="grid grid-cols-3 gap-[3px] p-1.5">
        {inventory.map((slot, i) => (
          <div key={slot.id} title={slot.label}
            className="aspect-square bg-[#8b8b8b] flex items-center justify-center border-[3px] relative cursor-pointer hover:bg-[#a0a0a0] group"
            style={{ borderColor: i === 1 ? '#fff #555 #555 #fff' : '#555 #ddd #ddd #555' }}>
            <span className="text-[18px] leading-none">{slot.emoji}</span>
            <span className="absolute bottom-[1px] right-[2px] font-pixel text-[5px] text-white drop-shadow-[1px_1px_0_#000]">{slot.count}</span>
            <div className="absolute bottom-[110%] left-1/2 -translate-x-1/2 hidden group-hover:block z-50 whitespace-nowrap bg-[rgba(16,0,16,0.9)] border-2 border-[#555] font-pixel text-[5px] text-white px-1.5 py-1">{slot.label}</div>
          </div>
        ))}
      </div>

      <div className="px-2 pb-1">
        <div className="font-pixel text-[5px] text-[#5aff5a] drop-shadow-[1px_1px_0_#000] flex justify-between mb-0.5">
          <span>{activeAgent} LV.{level}</span><span>{xpPct}%</span>
        </div>
        <McBar value={xpPct} variant="xp" className="h-[6px]" animate />
        <div className="flex justify-between mt-1">
          <div className="flex gap-1 items-center">
            <span className="font-pixel text-[4px] text-white/40">HP</span>
            <McBar value={hp} variant="hp" className="w-14" />
          </div>
          <div className="flex gap-1 items-center">
            <span className="font-pixel text-[4px] text-white/40">MP</span>
            <McBar value={mp} variant="mp" className="w-14" />
          </div>
        </div>
        {msgCount > 0 && <div className="font-pixel text-[4px] text-white/30 mt-1">{msgCount} messages sent</div>}
      </div>

      <SectionLabel>▶ ACTIVE QUESTS</SectionLabel>
      {tasks.map(task => (
        <div key={task.id} className="px-2 py-1.5 border-b border-white/10">
          <div className="flex items-start gap-1.5 mb-1">
            <span className="text-[12px] mt-px flex-shrink-0">{task.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-pixel text-[5px] text-white drop-shadow-[1px_1px_0_#000] mb-1 leading-[1.8]">{task.name}</div>
              <McBar value={task.progress}
                variant={task.status === 'done' ? 'xp' : task.status === 'running' ? 'gold' : 'quest'}
                animate={task.status === 'running'} />
            </div>
            <StatusDot status={task.status} />
          </div>
        </div>
      ))}

      <SectionLabel className="mt-1">▶ CRAFTING</SectionLabel>
      <div className="p-2">
        <div className="flex gap-2 items-center">
          <div className="grid grid-cols-3 gap-[2px]">
            {['🔍','⚡','🗄️','📡','🧬','🔧','','📜',''].map((e, i) => (
              <div key={i} className="w-[18px] h-[18px] bg-[#555] border-[2px] border-t-[#333] border-l-[#333] border-b-[#888] border-r-[#888] flex items-center justify-center text-[10px]">{e}</div>
            ))}
          </div>
          <span className="font-pixel text-[10px] text-white">→</span>
          <span className="text-[22px]">🤖</span>
        </div>
        <div className="font-pixel text-[4px] text-yellow-300 mt-1 drop-shadow-[1px_1px_0_#000]">✦ Recipe: SUPER AGENT (Legendary)</div>
      </div>
    </aside>
  )
}
