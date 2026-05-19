import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/common/Button'

export function LandingHeader() {
  const navigate = useNavigate()
  const { isAuthenticated, username } = useAuthStore()

  return (
    <header className="sticky top-0 w-full z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 group"
          aria-label="Craftgent home"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center btn-gradient text-white text-sm font-bold shadow-glow-sm">
            CG
          </div>
          <span className="text-text-primary font-semibold text-lg tracking-tight group-hover:text-accent-hover transition-colors">
            Craftgent
          </span>
        </button>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-text-secondary">
          <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
          <a href="#agents" className="hover:text-text-primary transition-colors">Agents</a>
          <a href="#security" className="hover:text-text-primary transition-colors">Security</a>
        </nav>

        {/* Auth controls */}
        <div className="flex items-center gap-3">
          {isAuthenticated && username ? (
            <>
              <span className="hidden sm:block text-text-secondary text-sm">
                Welcome, <span className="text-text-primary font-medium">{username}</span>
              </span>
              <Button variant="primary" onClick={() => navigate('/chat')} className="text-sm px-4 py-2">
                Open App →
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')} className="text-sm">
                Sign in
              </Button>
              <Button variant="primary" onClick={() => navigate('/login')} className="text-sm">
                Get started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
