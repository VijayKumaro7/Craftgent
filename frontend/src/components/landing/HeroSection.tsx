/**
 * HeroSection — hero banner with title, tagline, and main CTA
 */
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'

export function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center py-20 px-6 overflow-hidden">
      {/* Parallax background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              width: Math.random() * 30 + 10 + 'px',
              height: Math.random() * 30 + 10 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.3 + 0.1,
              backgroundColor: ['#5d9e32', '#6abf38', '#55ffff', '#aaffaa'][Math.floor(Math.random() * 4)],
            }}
          />
        ))}
      </div>

      {/* Hero content */}
      <div className="relative text-center max-w-4xl mx-auto animate-fade-in">
        {/* Main title */}
        <div className="mb-6">
          <h1 className="font-pixel text-[20px] md:text-[28px] text-[#5d9e32] mb-4" style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.8)' }}>
            ⛏ CRAFTGENT
          </h1>
          <div className="h-1 w-32 bg-[#5d9e32] mx-auto mb-8" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.8)' }} />
        </div>

        {/* Subtitle */}
        <h2 className="font-terminal text-[10px] md:text-[12px] text-[#55ffff] mb-4 uppercase leading-relaxed" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.8)' }}>
          Enter the Minecraft AI Command Center
        </h2>

        {/* Description */}
        <p className="font-terminal text-[8px] text-[#aaffaa] mb-8 max-w-2xl mx-auto leading-relaxed">
          Harness the power of 4 specialized AI agents. Route your tasks intelligently. Craft solutions in real-time. A retro-futuristic collaboration between you and cutting-edge artificial intelligence.
        </p>

        {/* Features teaser */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {['Real-time Chat', 'Agent Routing', 'File Upload', 'Web Search'].map((feature, idx) => (
            <div
              key={idx}
              className="px-3 py-1 bg-[rgba(93,158,50,0.2)] border border-[#5d9e32] font-pixel text-[6px] text-[#5d9e32]"
              style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.8)' }}
            >
              ✓ {feature}
            </div>
          ))}
        </div>

        {/* Main CTA button */}
        <Button
          variant="primary"
          onClick={() => navigate('/login')}
          className="text-[10px] px-8 py-4 mb-6 hover:scale-105 transition-transform"
        >
          ▶ GET STARTED
        </Button>

        {/* Scroll hint */}
        <div className="mt-16 animate-bounce">
          <p className="font-pixel text-[6px] text-[#ffff55] mb-2">Scroll to explore</p>
          <div className="text-[20px]">↓</div>
        </div>
      </div>
    </section>
  )
}
