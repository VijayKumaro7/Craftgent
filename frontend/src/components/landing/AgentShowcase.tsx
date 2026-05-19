import { useEffect, useRef, useState } from 'react'
import { AgentCard } from '@/components/common/AgentCard'

const AGENTS = [
  {
    name: 'NEXUS',
    role: 'Research Orchestrator',
    description: 'The command center. NEXUS handles general Q&A, synthesizes research, and intelligently routes complex tasks to the right specialist agent.',
    imageSrc: '/assets/agents/nexus.png',
    color: '#6366f1',
    abilities: ['Orchestrate', 'Research', 'Delegate'],
  },
  {
    name: 'ALEX',
    role: 'Code Specialist',
    description: 'Your engineering co-pilot. ALEX generates, debugs, and optimizes code across any language — and can execute it in a sandboxed environment.',
    imageSrc: '/assets/agents/alex.png',
    color: '#10b981',
    abilities: ['Generate', 'Debug', 'Execute'],
  },
  {
    name: 'VORTEX',
    role: 'Data Analyst',
    description: 'Master of structured data. VORTEX runs SQL queries, performs statistical analysis, and extracts actionable insights from raw datasets.',
    imageSrc: '/assets/agents/vortex.png',
    color: '#a855f7',
    abilities: ['Analyze', 'Query', 'Visualize'],
  },
  {
    name: 'RESEARCHER',
    role: 'Deep Investigator',
    description: 'The fact-finder. RESEARCHER performs multi-step web research, verifies sources, and synthesizes comprehensive reports from live information.',
    imageSrc: '/assets/agents/researcher.png',
    color: '#f59e0b',
    abilities: ['Investigate', 'Verify', 'Report'],
  },
]

export function AgentShowcase() {
  const [visible, setVisible] = useState<boolean[]>(Array(4).fill(false))
  const ref = useRef<HTMLDivElement>(null)

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
      style={{ background: 'rgba(99,102,241,0.03)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-accent-primary text-sm font-semibold uppercase tracking-widest mb-3">Meet the team</p>
          <h2 className="text-4xl font-bold text-text-primary mb-4">Your AI agent squad</h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Four specialized agents collaborate through LangGraph — each expert in their domain, coordinated by NEXUS.
          </p>
        </div>

        {/* Agent grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {AGENTS.map((agent, idx) => (
            <div
              key={idx}
              style={{ transitionDelay: `${idx * 100}ms` }}
              className={`transition-all duration-500 ${visible[idx] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <AgentCard {...agent} />
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <p className="text-center text-text-muted text-sm mt-10">
          Each agent specializes in different domains — route your query to the right expert for the best results.
        </p>
      </div>
    </section>
  )
}
