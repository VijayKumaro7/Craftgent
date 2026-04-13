/**
 * LandingHeader — navigation header for landing page
 */
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/common/Button'

export function LandingHeader() {
  const navigate = useNavigate()
  const { isAuthenticated, username } = useAuthStore()

  return (
    <header
      className="sticky top-0 w-full px-6 py-4 flex items-center justify-between bg-[rgba(0,0,0,0.5)] backdrop-blur-sm border-b-3 border-[#5d9e32]"
      style={{
        textShadow: '2px 2px 0 rgba(0,0,0,0.8)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        className="font-pixel text-[14px] text-[#5d9e32] cursor-pointer hover:text-[#6abf38] transition-colors"
        onClick={() => navigate('/')}
      >
        ⛏ CRAFTGENT
      </div>

      {/* Right side - Login or Dashboard link */}
      <div className="flex items-center gap-4">
        {isAuthenticated && username ? (
          <div className="flex items-center gap-4">
            <span className="font-pixel text-[8px] text-[#aaffaa]">{username}</span>
            <Button
              variant="primary"
              onClick={() => navigate('/chat')}
              className="text-[8px]"
            >
              ENTER WORLD
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            onClick={() => navigate('/login')}
            className="text-[8px]"
          >
            ▶ LOGIN
          </Button>
        )}
      </div>
    </header>
  )
}
