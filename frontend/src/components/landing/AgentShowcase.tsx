/**
 * AgentShowcase — showcase the 4 AI agents with details
 */
import { useEffect, useRef, useState } from 'react'
import { AgentCard } from '@/components/common/AgentCard'

const AGENTS = [
  {
    name: 'NEXUS',
    role: 'Research Mage',
    description: 'The orchestrator. General Q&A, research synthesis, and knowledge delegation. Routes complex tasks to specialized agents.',
    imageSrc: '/assets/agents/nexus.png',
    color: '#55ffff',
    abilities: ['Orchestrate', 'Research', 'Synthesize'],
  },
  {
    name: 'ALEX',
    role: 'Code Warrior',
    description: 'The specialist in code. Generation, debugging, architecture design, and optimization. Executes and tests code solutions.',
    imageSrc: '/assets/agents/alex.png',
    color: '#aaffaa',
    abilities: ['Generate', 'Debug', 'Optimize'],
  },
  {
    name: 'VORTEX',
    role: 'Data Creeper',
    description: 'Master of data. Analytics, SQL queries, statistical analysis, and dataset visualization. Extracts insights from raw data.',
    imageSrc: '/assets/agents/vortex.png',
    color: '#cc88ff',
    abilities: ['Analyze', 'Query', 'Visualize'],
  },
  {
    name: 'RESEARCHER',
    role: 'Archaeologist',
    description: 'The investigator. Deep research, source verification, multi-step analysis. Unearths truths buried in information.',
    imageSrc: '/assets/agents/researcher.png',
    color: '#d4a574',
    abilities: ['Investigate', 'Verify', 'Synthesize'],
  },
]

export function AgentShowcase() {
  const [visibleAgents, setVisibleAgents] = useState<boolean[]>(Array(4).fill(false))
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Stagger reveal animation
            AGENTS.forEach((_, idx) => {
              setTimeout(() => {
                setVisibleAgents(prev => {
                  const newState = [...prev]
                  newState[idx] = true
                  return newState
                })
              }, idx * 150)
            })
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-20 px-6 bg-[rgba(0,0,0,0.1)]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="font-pixel text-[16px] text-[#5d9e32] mb-4" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.8)' }}>
            🎮 THE PARTY MEMBERS
          </h2>
          <p className="font-terminal text-[8px] text-[#aaffaa] mb-4">Four specialized agents ready to collaborate</p>
          <div className="h-1 w-24 bg-[#5d9e32] mx-auto" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.8)' }} />
        </div>

        {/* Agents grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {AGENTS.map((agent, idx) => (
            <div
              key={idx}
              className={`transform transition-all duration-500 ${
                visibleAgents[idx]
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: visibleAgents[idx] ? `${idx * 150}ms` : '0ms',
              }}
            >
              <AgentCard
                name={agent.name}
                role={agent.role}
                description={agent.description}
                imageSrc={agent.imageSrc}
                color={agent.color}
                abilities={agent.abilities}
              />
            </div>
          ))}
        </div>

        {/* Agent interaction hint */}
        <div className="mt-12 text-center">
          <p className="font-terminal text-[8px] text-[#55ffff]">
            Each agent specializes in different tasks. Route your queries to the right agent for optimal results.
          </p>
        </div>
      </div>
    </section>
  )
}
