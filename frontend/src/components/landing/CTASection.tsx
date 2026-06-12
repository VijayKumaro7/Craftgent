import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { NeuralNet3D } from './NeuralNet3D'
import { useMouseParallax } from '@/hooks/useMouseParallax'
import { useAuthStore } from '@/store/useAuthStore'

const TRUST_ITEMS = [
  { icon: '🔒', label: 'Bcrypt Password Hashing' },
  { icon: '🛡️', label: 'JWT Authentication' },
  { icon: '🔐', label: 'Secure Database' },
]

export function CTASection() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 })
  const { onMouseMove, onMouseLeave } = useMouseParallax(5)

  return (
    <section id="security" className="py-24 px-6" style={{ perspective: '1200px' }}>
      <div className="max-w-3xl mx-auto text-center">
        {/* Neural net 3D illustration */}
        <NeuralNet3D />

        {/* Card container — mouse-tilt 3D */}
        <div
          style={{
            transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
            transition: 'transform 0.15s ease-out',
            transformStyle: 'preserve-3d',
            willChange: 'transform',
          }}
          onMouseMove={e => onMouseMove(e, setTilt)}
          onMouseLeave={() => onMouseLeave(setTilt)}
        >
          <div
            className="bg-bg-secondary border border-border-subtle rounded-2xl p-10 sm:p-14 animate-card-glow"
            style={{
              boxShadow: '0 8px 40px rgba(124,58,237,0.08), 0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            {/* Gradient accent bar */}
            <div
              className="h-1 w-20 mx-auto mb-8 rounded-full"
              style={{ background: 'linear-gradient(90deg,#7c3aed,#a78bfa)' }}
            />

            <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4 leading-tight">
              {isAuthenticated ? 'Your agents are ready' : 'Ready to get started?'}
            </h2>
            <p className="text-text-secondary text-lg mb-10 leading-relaxed">
              {isAuthenticated
                ? 'You’re signed in. Head to your workspace and put NEXUS, ALEX, VORTEX, and RESEARCHER to work.'
                : 'Join developers and researchers using Craftgent to build faster, research deeper, and deliver better results with specialized AI agents.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              {isAuthenticated ? (
                <Button
                  variant="primary"
                  onClick={() => navigate('/chat')}
                  className="w-full sm:w-auto text-base px-10 py-3"
                >
                  Go to your workspace →
                </Button>
              ) : (
                <>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/login')}
                    className="w-full sm:w-auto text-base px-10 py-3"
                  >
                    Create free account →
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="w-full sm:w-auto text-base px-10 py-3"
                  >
                    Sign in
                  </Button>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border-subtle pt-8">
              <p className="text-text-muted text-xs uppercase tracking-widest mb-5">Built with security in mind</p>
              <div className="flex flex-wrap justify-center gap-6">
                {TRUST_ITEMS.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-text-secondary text-sm">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-text-muted text-xs">
          Craftgent v0.2.0 — Multi-Agent AI Command Center
        </p>
      </div>
    </section>
  )
}
