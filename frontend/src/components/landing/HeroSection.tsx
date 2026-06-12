import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { Hero3DScene } from './Hero3DScene'
import { useMouseParallax } from '@/hooks/useMouseParallax'
import { useAuthStore } from '@/store/useAuthStore'

const BADGES = ['Real-time Streaming', 'Multi-Agent Routing', 'File Analysis', 'Web Search', 'Code Execution']

export function HeroSection() {
  const navigate = useNavigate()
  const { isAuthenticated, username } = useAuthStore()
  const sectionRef = useRef<HTMLElement>(null)
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 })
  const [scrollZ, setScrollZ] = useState(0)
  const { onMouseMove, onMouseLeave } = useMouseParallax(8)

  useEffect(() => {
    const container = sectionRef.current?.closest('[style*="overflow"]') as HTMLElement | null
    const scrollEl = container ?? window

    function handleScroll() {
      const scrollY = container ? container.scrollTop : (window.scrollY || 0)
      setScrollZ(Math.min(scrollY * 0.15, 60))
    }

    scrollEl.addEventListener('scroll', handleScroll, { passive: true })
    return () => scrollEl.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[90vh] flex items-center justify-center py-24 px-6 overflow-hidden scene-3d"
    >
      {/* Decorative radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: 900,
          height: 900,
          background: 'radial-gradient(circle at center,rgba(124,58,237,0.1) 0%,transparent 65%)',
        }}
      />

      {/* 3D perspective grid (background depth) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(124,58,237,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.04) 1px,transparent 1px)`,
          backgroundSize: '60px 60px',
          transform: 'perspective(800px) rotateX(20deg) scale(1.4)',
          transformOrigin: 'center 80%',
          opacity: 0.7,
        }}
      />

      <div className="relative w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 animate-fade-in">
        {/* Text content — mouse parallax tilt */}
        <div
          className="text-center lg:text-left max-w-xl flex-1 card-3d"
          style={{
            transform: `perspective(1200px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateZ(-${scrollZ}px)`,
            transition: 'transform 0.12s ease-out',
            willChange: 'transform',
          }}
          onMouseMove={e => onMouseMove(e, setTilt)}
          onMouseLeave={() => onMouseLeave(setTilt)}
        >
          {/* Eyebrow label */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-primary/10 border border-accent-primary/30 text-sm text-text-secondary mb-8">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse inline-block" />
            {isAuthenticated
              ? `Signed in as ${username ?? 'Operator'} · agents standing by`
              : 'Multi-Agent AI Platform · v0.2.0'}
          </div>

          {/* Main headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
            {isAuthenticated ? (
              <>
                <span className="text-text-primary">Welcome back.</span>
                <br />
                <span className="gradient-text">Your Squad Is Ready</span>
              </>
            ) : (
              <>
                <span className="text-text-primary">AI Agents That</span>
                <br />
                <span className="gradient-text">Think, Build &amp; Deliver</span>
              </>
            )}
          </h1>

          {/* Sub-headline */}
          <p className="text-text-secondary text-lg sm:text-xl mb-10 leading-relaxed">
            {isAuthenticated
              ? 'NEXUS, ALEX, VORTEX, and RESEARCHER are waiting in your workspace. Jump back into the chat, or pick the specialist below that fits your next task.'
              : 'Craftgent orchestrates four specialized AI agents — NEXUS, ALEX, VORTEX, and RESEARCHER — routing your tasks intelligently through LangGraph to deliver accurate, real-time results.'}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
            {isAuthenticated ? (
              <>
                <Button
                  variant="primary"
                  onClick={() => navigate('/chat')}
                  className="w-full sm:w-auto text-base px-8 py-3"
                >
                  Open the chat →
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => document.getElementById('agents')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto text-base px-8 py-3"
                >
                  Choose an agent
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="primary"
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto text-base px-8 py-3"
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
              </>
            )}
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-2">
            {BADGES.map((badge, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-bg-secondary border border-border-subtle text-text-secondary"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent-primary/70 inline-block" />
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* 3D Scene — right side, counter-moves on scroll */}
        <div
          className="flex-shrink-0 w-full lg:w-auto"
          style={{
            transform: `perspective(1200px) translateZ(${scrollZ * 0.5}px)`,
            transition: 'transform 0.12s ease-out',
            willChange: 'transform',
          }}
        >
          <Hero3DScene />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-text-muted animate-float">
        <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
        <svg width="16" height="20" viewBox="0 0 16 20" fill="none" aria-hidden="true">
          <path d="M8 0v16M1 9l7 8 7-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </section>
  )
}
