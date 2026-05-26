import React, { useEffect } from 'react'
import { useAppStore }   from '@/store/useAppStore'
import { useAgentStats } from '@/hooks/useAgentStats'
import { AGENTS }        from '@/types'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-2.5 border-b border-border-subtle">
      <span className="text-text-muted text-xs font-semibold uppercase tracking-widest">{children}</span>
    </div>
  )
}

function ProgressBar({ value, color = '#7c3aed', animate = false }: { value: number; color?: string; animate?: boolean }) {
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <div
        className={`h-full rounded-full ${animate ? 'transition-[width] duration-500' : ''}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
      />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; color: string; bg: string }> = {
    done:    { label: 'Done',    color: '#059669', bg: 'rgba(5,150,105,0.12)' },
    running: { label: 'Running', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
    queued:  { label: 'Queued',  color: '#64748b', bg: 'rgba(100,116,139,0.12)'  },
  }
  const c = cfg[status] ?? cfg.queued
  return (
    <span
      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${status === 'running' ? 'animate-pulse' : ''}`}
      style={{ color: c.color, background: c.bg }}
    >
      {c.label}
    </span>
  )
}

export function TaskPanel() {
  const { tasks, updateTaskProgress, inventory, activeAgent } = useAppStore(s => ({
    tasks:              s.tasks,
    updateTaskProgress: s.updateTaskProgress,
    inventory:          s.inventory,
    activeAgent:        s.activeAgent,
  }))
  const { data: statsData } = useAgentStats()
  const staticAgent = AGENTS[activeAgent]
  const live     = statsData?.stats?.[activeAgent]
  const hp       = live?.hp         ?? staticAgent.hp
  const mp       = live?.mp         ?? staticAgent.mp
  const level    = live?.level      ?? staticAgent.level
  const xpPct    = live?.xp_percent ?? staticAgent.xp
  const msgCount = live?.message_count ?? 0

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
    <aside
      className="flex flex-col overflow-y-auto border-l border-border-subtle bg-bg-secondary"
      style={{ scrollbarWidth: 'none' }}
    >
      {/* Inventory */}
      <SectionLabel>Inventory</SectionLabel>
      <div className="grid grid-cols-3 gap-1.5 p-3">
        {inventory.map((slot) => (
          <div
            key={slot.id}
            title={slot.label}
            className="aspect-square rounded-lg flex items-center justify-center relative cursor-pointer group border border-border-subtle hover:border-accent-primary transition-colors duration-200"
            style={{ background: 'rgba(30, 30, 40, 0.4)' }}
          >
            <span className="text-xl leading-none">{slot.emoji}</span>
            <span className="absolute bottom-1 right-1 text-[10px] text-text-muted font-mono">{slot.count}</span>
            {/* Tooltip */}
            <div className="absolute bottom-[110%] left-1/2 -translate-x-1/2 hidden group-hover:block z-50 whitespace-nowrap rounded-lg text-xs text-text-secondary px-2.5 py-1.5 pointer-events-none border border-border-subtle shadow-md" style={{ background: 'rgba(18, 18, 26, 0.95)' }}>
              {slot.label}
            </div>
          </div>
        ))}
      </div>

      {/* Agent stats */}
      <div className="px-4 pb-4">
        {/* Level + XP */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-semibold text-text-primary">{activeAgent}</span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}
          >
            Lv.{level}
          </span>
        </div>
        <div className="flex justify-between text-xs text-text-muted mb-1">
          <span>XP</span><span>{xpPct}%</span>
        </div>
        <ProgressBar value={xpPct} color="linear-gradient(90deg,#7c3aed,#a78bfa)" animate />

        <div className="flex gap-3 mt-2.5">
          <div className="flex-1">
            <div className="flex justify-between text-[10px] text-text-muted mb-1">
              <span>HP</span><span>{hp}%</span>
            </div>
            <ProgressBar value={hp} color="#059669" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-[10px] text-text-muted mb-1">
              <span>MP</span><span>{mp}%</span>
            </div>
            <ProgressBar value={mp} color="#8b5cf6" />
          </div>
        </div>
        {msgCount > 0 && (
          <p className="text-[10px] text-text-muted mt-2">{msgCount} messages sent</p>
        )}
      </div>

      {/* Active tasks */}
      <SectionLabel>Active Tasks</SectionLabel>
      {tasks.map(task => (
        <div key={task.id} className="px-4 py-3 border-b border-border-subtle/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base flex-shrink-0">{task.icon}</span>
            <span className="text-sm text-text-primary flex-1 min-w-0 truncate">{task.name}</span>
            <StatusBadge status={task.status} />
          </div>
          <ProgressBar
            value={task.progress}
            color={task.status === 'done' ? '#059669' : task.status === 'running' ? '#f97316' : '#64748b'}
            animate={task.status === 'running'}
          />
        </div>
      ))}

      {/* Quick actions */}
      <SectionLabel>Quick Actions</SectionLabel>
      <div className="p-3 space-y-2">
        {[
          { icon: '🔍', label: 'Web Search' },
          { icon: '💻', label: 'Run Code' },
          { icon: '📊', label: 'SQL Query' },
          { icon: '📜', label: 'Summarize' },
        ].map(action => (
          <button
            key={action.label}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm text-text-secondary hover:text-text-primary transition-all duration-200 border border-border-subtle hover:border-accent-primary"
            style={{ background: 'rgba(30, 30, 40, 0.4)' }}
          >
            <span>{action.icon}</span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
