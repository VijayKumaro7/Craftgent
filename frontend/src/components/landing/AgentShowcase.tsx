import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import type { AgentName } from '@/types'

const AGENTS = [
  {
    name: 'NEXUS',
    role: 'Research Orchestrator',
    description: 'The command center. NEXUS handles general Q&A, synthesizes research, and intelligently routes complex tasks to the right specialist agent.',
    color: '#7c3aed',
    abilities: ['Orchestrate', 'Research', 'Delegate'],
    icon: '🧠',
    bgGradient: 'linear-gradient(135deg,#3b0764,#1e1030)',
  },
  {
    name: 'ALEX',
    role: 'Code Specialist',
    description: 'Your engineering co-pilot. ALEX generates, debugs, and optimizes code across any language — and can execute it in a sandboxed environment.',
    color: '#059669',
    abilities: ['Generate', 'Debug', 'Execute'],
    icon: '⚡',
    bgGradient: 'linear-gradient(135deg,#022c22,#0f2922)',
  },
  {
    name: 'VORTEX',
    role: 'Data Analyst',
    description: 'Master of structured data. VORTEX runs SQL queries, performs statistical analysis, and extracts actionable insights from raw datasets.',
    color: '#a78bfa',
    abilities: ['Analyze', 'Query', 'Visualize'],
    icon: '🌀',
    bgGradient: 'linear-gradient(135deg,#2e1065,#1e1030)',
  },
  {
    name: 'RESEARCHER',
    role: 'Deep Investigator',
    description: 'The fact-finder. RESEARCHER performs multi-step web research, verifies sources, and synthesizes comprehensive reports from live information.',
    color: '#f97316',
    abilities: ['Investigate', 'Verify', 'Report'],
    icon: '🔭',
    bgGradient: 'linear-gradient(135deg,#431407,#1c1008)',
  },
]

function AgentFlipCard({
  agent,
  visible,
  onChat,
}: {
  agent: (typeof AGENTS)[0]
  visible: boolean
  onChat?: () => void
}) {
  return (
    <div
      className="flip-card h-72"
      style={{
        transform: visible
          ? 'perspective(900px) translateZ(0) translateY(0)'
          : 'perspective(900px) translateZ(-80px) translateY(32px)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1), opacity 0.5s ease-out',
        willChange: 'transform',
      }}
    >
      <div className="flip-card-inner h-full rounded-2xl">
        {/* FRONT */}
        <div
          className="flip-card-front rounded-2xl border p-6 flex flex-col items-center text-center"
          style={{
            background: agent.bgGradient,
            borderColor: `${agent.color}30`,
          }}
        >
          {/* 3D floating icon */}
          <div
            className="text-5xl mb-4 animate-float-3d"
            style={{ filter: `drop-shadow(0 0 12px ${agent.color}60)` }}
          >
            {agent.icon}
          </div>

          {/* Name badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{
              background: `${agent.color}20`,
              border: `1px solid ${agent.color}50`,
              color: agent.color,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse inline-block"
              style={{ background: agent.color }}
            />
            {agent.name}
          </div>

          <h3 className="font-bold text-text-primary text-lg mb-2">{agent.role}</h3>
          <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">{agent.description}</p>

          <p className="text-text-muted text-xs mt-4 animate-pulse">Hover to flip →</p>
        </div>

        {/* BACK */}
        <div
          className="flip-card-back rounded-2xl border p-6 flex flex-col items-center justify-center text-center"
          style={{
            background: `linear-gradient(135deg,${agent.color}22,${agent.color}08)`,
            borderColor: `${agent.color}40`,
          }}
        >
          <div className="text-4xl mb-2">{agent.icon}</div>
          <h3 className="font-bold text-text-primary text-xl mb-1">{agent.name}</h3>
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: agent.color }}>
            Core Abilities
          </p>
          <div className="flex flex-col gap-2 w-full">
            {agent.abilities.map((ability, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  background: `${agent.color}15`,
                  border: `1px solid ${agent.color}30`,
                  color: agent.color,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: agent.color }}
                />
                {ability}
              </div>
            ))}
          </div>

          {onChat && (
            <button
              onClick={onChat}
              className="mt-3 w-full px-4 py-2 rounded-lg text-sm font-bold text-white transition-transform duration-150 hover:scale-[1.03]"
              style={{ background: agent.color }}
            >
              Chat with {agent.name} →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function AgentShowcase() {
  const [visible, setVisible] = useState<boolean[]>(Array(4).fill(false))
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const setActiveAgent = useAppStore(s => s.setActiveAgent)

  const startChatWith = (agent: AgentName) => {
    setActiveAgent(agent)
    navigate('/chat')
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            AGENTS.forEach((_, idx) => {
              setTimeout(() => {
                setVisible(prev => {
                  const next = [...prev]
                  next[idx] = true
                  return next
                })
              }, idx * 120)
            })
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="agents"
      ref={ref}
      className="py-24 px-6"
      style={{ background: 'rgba(124,58,237,0.03)', perspective: '1200px' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-accent-primary text-sm font-semibold uppercase tracking-widest mb-3">Meet the team</p>
          <h2 className="text-4xl font-bold text-text-primary mb-4">Your AI agent squad</h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            {isAuthenticated
              ? 'You’re signed in — pick the specialist that fits your task and start chatting right away.'
              : 'Four specialized agents collaborate through LangGraph — each expert in their domain, coordinated by NEXUS.'}
          </p>
        </div>

        {/* Agent grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {AGENTS.map((agent, idx) => (
            <div key={idx} style={{ transitionDelay: `${idx * 100}ms` }}>
              <AgentFlipCard
                agent={agent}
                visible={visible[idx]}
                onChat={isAuthenticated ? () => startChatWith(agent.name as AgentName) : undefined}
              />
            </div>
          ))}
        </div>

        <p className="text-center text-text-muted text-sm mt-10">
          {isAuthenticated
            ? 'Hover a card and hit “Chat with…” to open the workspace with that agent selected.'
            : 'Hover each agent card to reveal their core abilities.'}
        </p>
      </div>
    </section>
  )
}
