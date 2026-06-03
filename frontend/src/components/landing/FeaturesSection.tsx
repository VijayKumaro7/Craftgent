import { useEffect, useRef, useState } from 'react'
import { FeatureCard } from '@/components/common/FeatureCard'
import { useMouseParallax } from '@/hooks/useMouseParallax'

const FEATURES = [
  {
    icon: '💬',
    title: 'Real-Time Streaming',
    description: 'Responses stream character-by-character via WebSocket. See agents think in real time across multiple simultaneous sessions.',
  },
  {
    icon: '🤖',
    title: '4 Specialized Agents',
    description: 'NEXUS orchestrates, ALEX writes code, VORTEX handles data, RESEARCHER investigates. LangGraph routes each task to the right expert.',
  },
  {
    icon: '📁',
    title: 'File Analysis',
    description: 'Drop in CSV, JSON, PDF, or code files. Agents parse and summarize content automatically, turning raw files into actionable insights.',
  },
  {
    icon: '🔍',
    title: 'Live Web Search',
    description: 'Agents fetch real-time data from the web, synthesize sources, and verify facts — no stale training-data guesses.',
  },
  {
    icon: '💻',
    title: 'Code Execution',
    description: 'ALEX runs code in a sandboxed environment and returns results instantly. Test, debug, and iterate without leaving the chat.',
  },
  {
    icon: '🗄️',
    title: 'SQL & Data Queries',
    description: 'VORTEX executes SQL queries, performs statistical analysis, and generates visualizations directly from your datasets.',
  },
  {
    icon: '📊',
    title: 'Session History',
    description: 'Every conversation is stored and searchable. Pick up exactly where you left off with full context preserved.',
  },
  {
    icon: '🔒',
    title: 'Secure by Design',
    description: 'JWT auth with httpOnly refresh tokens, bcrypt hashing, rate limiting, and CORS hardening protect every request.',
  },
]

function TiltCard({ feature, visible }: { feature: (typeof FEATURES)[0]; visible: boolean }) {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 })
  const { onMouseMove, onMouseLeave } = useMouseParallax(12)

  return (
    <div
      style={{ perspective: '800px' }}
      onMouseMove={e => onMouseMove(e, setTilt)}
      onMouseLeave={() => onMouseLeave(setTilt)}
    >
      <div
        style={{
          transform: visible
            ? `perspective(800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateZ(0)`
            : 'perspective(800px) rotateX(20deg) translateY(30px)',
          opacity: visible ? 1 : 0,
          transition: visible
            ? 'transform 0.15s ease-out, opacity 0.5s ease-out'
            : 'opacity 0.5s ease-out',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        <FeatureCard icon={feature.icon} title={feature.title} description={feature.description} />
      </div>
    </div>
  )
}

export function FeaturesSection() {
  const [visible, setVisible] = useState<boolean[]>(Array(FEATURES.length).fill(false))
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            FEATURES.forEach((_, idx) => {
              setTimeout(() => {
                setVisible(prev => {
                  const next = [...prev]
                  next[idx] = true
                  return next
                })
              }, idx * 80)
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
    <section id="features" ref={ref} className="py-24 px-6" style={{ perspective: '1200px' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-accent-primary text-sm font-semibold uppercase tracking-widest mb-3">Platform capabilities</p>
          <h2 className="text-4xl font-bold text-text-primary mb-4">Everything you need</h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto">
            A full-stack AI command center built for developers, researchers, and knowledge workers.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature, idx) => (
            <div key={idx} style={{ transitionDelay: `${idx * 60}ms` }}>
              <TiltCard feature={feature} visible={visible[idx]} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
