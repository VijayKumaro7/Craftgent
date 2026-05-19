import React from 'react'
import { AGENTS } from '@/types'
import type { AgentName } from '@/types'
import { useAppStore } from '@/store/useAppStore'
import { PixelHead }   from '@/components/ui/PixelHead'
import { SessionHistory }    from '@/components/chat/SessionHistory'
import { TemplatesPanel }    from '@/components/chat/TemplatesPanel'
import { AgentHistoryPanel } from '@/components/agents/AgentHistoryPanel'

const AGENT_COLORS: Record<string, string> = {
  NEXUS:      '#6366f1',
  ALEX:       '#10b981',
  VORTEX:     '#a855f7',
  RESEARCHER: '#f59e0b',
}

const ABILITIES = [
  { label: 'Web Search',     on: true  },
  { label: 'Code Execution', on: true  },
  { label: 'RAG / Memory',   on: true  },
  { label: 'SQL Agent',      on: true,  isNew: true },
  { label: 'Vision',         on: false },
  { label: 'Voice',          on: false },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-2.5 border-b border-border-subtle">
      <span className="text-text-muted text-xs font-semibold uppercase tracking-widest">{children}</span>
    </div>
  )
}

export function AgentSidebar() {
  const { activeAgent, setActiveAgent, isStreaming, insertIntoInput } = useAppStore(s => ({
    activeAgent:    s.activeAgent,
    setActiveAgent: s.setActiveAgent,
    isStreaming:    s.isStreaming,
    insertIntoInput: s.insertIntoInput,
  }))

  return (
    <aside
      className="flex flex-col overflow-y-auto border-r border-border-subtle"
      style={{ background: 'rgba(10,10,15,0.85)', scrollbarWidth: 'none' }}
    >
      <SectionLabel>Agents</SectionLabel>

      {(Object.keys(AGENTS) as AgentName[]).map(name => {
        const agent    = AGENTS[name]
        const isActive = activeAgent === name
        const isPulsing = isActive && isStreaming
        const color = AGENT_COLORS[name] ?? '#6366f1'

        return (
          <button
            key={name}
            onClick={() => { if (!isStreaming) setActiveAgent(name) }}
            disabled={isStreaming}
            className={`w-full text-left px-3 py-3 border-b border-border-subtle/50 transition-all duration-200 focus:outline-none ${
              isActive
                ? 'bg-accent-primary/8'
                : 'hover:bg-white/[0.04]'
            } ${isStreaming ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            style={isActive ? { borderLeft: `3px solid ${color}` } : { borderLeft: '3px solid transparent' }}
            aria-pressed={isActive}
          >
            <div className="flex gap-3 items-start">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="rounded-lg overflow-hidden" style={{ width: 32, height: 32 }}>
                  <PixelHead agent={name} size={32} />
                </div>
                {/* Status dot */}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-bg-primary ${isPulsing ? 'animate-pulse' : ''}`}
                  style={{ background: isPulsing ? '#f59e0b' : color }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-sm font-semibold text-text-primary">{name}</span>
                  {isActive && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${color}20`, color }}>
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xs text-text-muted">{agent.role}</div>

                {/* Compact stat bars */}
                <div className="mt-1.5 flex gap-2">
                  <div className="flex-1">
                    <div className="flex justify-between mb-0.5">
                      <span className="text-[10px] text-text-muted">HP</span>
                      <span className="text-[10px] text-text-muted">{agent.hp}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-success transition-all" style={{ width: `${agent.hp}%` }} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-0.5">
                      <span className="text-[10px] text-text-muted">MP</span>
                      <span className="text-[10px] text-text-muted">{agent.mp}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-accent-cyan transition-all" style={{ width: `${agent.mp}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </button>
        )
      })}

      {/* Abilities */}
      <SectionLabel>Capabilities</SectionLabel>
      <div className="px-4 py-3 space-y-2">
        {ABILITIES.map(({ label, on, isNew }) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: on ? '#6366f1' : '#475569' }}
            />
            <span className={`text-xs ${on ? 'text-text-secondary' : 'text-text-muted'}`}>{label}</span>
            {isNew && (
              <span className="text-[10px] px-1 py-px rounded bg-success/20 text-success font-medium">New</span>
            )}
          </div>
        ))}
      </div>

      {/* Bottom panels */}
      <div className="mt-auto border-t border-border-subtle">
        <AgentHistoryPanel />
        <TemplatesPanel onSelectTemplate={insertIntoInput} />
        <SessionHistory />
      </div>
    </aside>
  )
}
