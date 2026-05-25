import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'

const TRUST_ITEMS = [
  { icon: '🔒', label: 'Bcrypt Password Hashing' },
  { icon: '🛡️', label: 'JWT Authentication' },
  { icon: '🔐', label: 'Secure Database' },
]

export function CTASection() {
  const navigate = useNavigate()

  return (
    <section id="security" className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        {/* Card container */}
        <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-10 sm:p-14">
          {/* Gradient accent bar */}
          <div
            className="h-1 w-20 mx-auto mb-8 rounded-full"
            style={{ background: 'linear-gradient(90deg,#7c3aed,#a78bfa)' }}
          />

          <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4 leading-tight">
            Ready to get started?
          </h2>
          <p className="text-text-secondary text-lg mb-10 leading-relaxed">
            Join developers and researchers using Craftgent to build faster, research deeper,
            and deliver better results with specialized AI agents.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
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

        {/* Footer */}
        <p className="mt-8 text-text-muted text-xs">
          Craftgent v0.2.0 — Multi-Agent AI Command Center
        </p>
      </div>
    </section>
  )
}
