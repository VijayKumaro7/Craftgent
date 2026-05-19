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

function ProgressBar({ value, color = '#6366f1', animate = false }: { value: number; color?: string; animate?: boolean }) {
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
    done:    { label: 'Done',    color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    running: { label: 'Running', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    queued:  { label: 'Queued',  color: '#475569', bg: 'rgba(71,85,105,0.12)'  },
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
      className="flex flex-col overflow-y-auto border-l border-border-subtle"
      style={{ background: 'rgba(10,10,15,0.85)', scrollbarWidth: 'none' }}
    >
      {/* Inventory */}
      <SectionLabel>Inventory</SectionLabel>
      <div className="grid grid-cols-3 gap-1.5 p-3">
        {inventory.map((slot) => (
          <div
            key={slot.id}
            title={slot.label}
            className="aspect-square glass-card rounded-lg flex items-center justify-center relative cursor-pointer group"
          >
            <span className="text-xl leading-none">{slot.emoji}</span>
            <span className="absolute bottom-1 right-1 text-[10px] text-text-muted font-mono">{slot.count}</span>
            {/* Tooltip */}
            <div className="absolute bottom-[110%] left-1/2 -translate-x-1/2 hidden group-hover:block z-50 whitespace-nowrap glass-strong rounded-lg text-xs text-text-secondary px-2.5 py-1.5 pointer-events-none">
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
            style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}
          >
            Lv.{level}
          </span>
        </div>
        <div className="flex justify-between text-xs text-text-muted mb-1">
          <span>XP</span><span>{xpPct}%</span>
        </div>
        <ProgressBar value={xpPct} color="linear-gradient(90deg,#6366f1,#a855f7)" animate />

        <div className="flex gap-3 mt-2.5">
          <div className="flex-1">
            <div className="flex justify-between text-[10px] text-text-muted mb-1">
              <span>HP</span><span>{hp}%</span>
            </div>
            <ProgressBar value={hp} color="#10b981" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-[10px] text-text-muted mb-1">
              <span>MP</span><span>{mp}%</span>
            </div>
            <ProgressBar value={mp} color="#06b6d4" />
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
            color={task.status === 'done' ? '#10b981' : task.status === 'running' ? '#f59e0b' : '#475569'}
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
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg glass-card text-left text-sm text-text-secondary hover:text-text-primary transition-all duration-200"
          >
            <span>{action.icon}</span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
