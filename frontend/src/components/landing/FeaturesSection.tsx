/**
 * FeaturesSection — showcase key features in grid layout
 */
import { useEffect, useRef, useState } from 'react'
import { FeatureCard } from '@/components/common/FeatureCard'

const FEATURES = [
  {
    icon: '💬',
    title: 'Real-Time Chat',
    description: 'Stream responses character-by-character with live agent interactions. Multiple simultaneous conversations with persistent history.',
  },
  {
    icon: '🤖',
    title: '4 AI Agents',
    description: 'NEXUS (Research), ALEX (Code), VORTEX (Data), RESEARCHER (Deep Investigation). Route tasks intelligently with LangGraph.',
  },
  {
    icon: '📁',
    title: 'File Upload',
    description: 'Process CSV, JSON, PDF, and code files. Drag-drop interface with automatic content analysis and summaries.',
  },
  {
    icon: '🔍',
    title: 'Web Search',
    description: 'Real-time data fetching, information synthesis, and source verification for accurate research.',
  },
  {
    icon: '⚙️',
    title: 'Customization',
    description: 'Configure response format, tone, language, and code syntax. Personalize your agent experience.',
  },
  {
    icon: '📊',
    title: 'Session History',
    description: 'Browse past conversations, search by date or agent. Build on previous sessions without context loss.',
  },
  {
    icon: '💻',
    title: 'Code Execution',
    description: 'Execute code safely in sandboxed environment. Test solutions instantly without leaving the chat.',
  },
  {
    icon: '⭐',
    title: 'Agent Progression',
    description: 'Earn XP with agents, level them up, and track HP/MP stats. A true RPG-style experience.',
  },
]

export function FeaturesSection() {
  const [visibleFeatures, setVisibleFeatures] = useState<boolean[]>(Array(FEATURES.length).fill(false))
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Stagger reveal animation
            FEATURES.forEach((_, idx) => {
              setTimeout(() => {
                setVisibleFeatures(prev => {
                  const newState = [...prev]
                  newState[idx] = true
                  return newState
                })
              }, idx * 100)
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
      className="py-20 px-6 bg-[rgba(0,0,0,0.3)]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="font-pixel text-[16px] text-[#5d9e32] mb-4" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.8)' }}>
            ⚡ CORE FEATURES
          </h2>
          <div className="h-1 w-24 bg-[#5d9e32] mx-auto" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.8)' }} />
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature, idx) => (
            <div
              key={idx}
              className={`transform transition-all duration-500 ${
                visibleFeatures[idx]
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
