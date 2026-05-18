import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'

const BADGES = ['Real-time Streaming', 'Multi-Agent Routing', 'File Analysis', 'Web Search', 'Code Execution']

export function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center py-24 px-6 overflow-hidden">
      {/* Decorative radial glow behind hero */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: 800,
          height: 800,
          background: 'radial-gradient(circle at center,rgba(99,102,241,0.12) 0%,transparent 70%)',
        }}
      />

      <div className="relative text-center max-w-4xl mx-auto animate-fade-in">
        {/* Eyebrow label */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-sm text-text-secondary mb-8">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse inline-block" />
          Multi-Agent AI Platform · v0.2.0
        </div>

        {/* Main headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
          <span className="text-text-primary">AI Agents That</span>
          <br />
          <span className="gradient-text">Think, Build &amp; Deliver</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Craftgent orchestrates four specialized AI agents — NEXUS, ALEX, VORTEX, and RESEARCHER —
          routing your tasks intelligently through LangGraph to deliver accurate, real-time results.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <Button
            variant="primary"
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto text-base px-8 py-3 shadow-glow-md"
          >
            Start for free →
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto text-base px-8 py-3"
          >
            Sign in
          </Button>
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap justify-center gap-2">
          {BADGES.map((badge, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium glass text-text-secondary"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent-primary/70 inline-block" />
              {badge}
            </span>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 flex flex-col items-center gap-1 text-text-muted animate-float">
          <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none" aria-hidden="true">
            <path d="M8 0v16M1 9l7 8 7-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </section>
  )
}
