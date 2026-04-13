/**
 * CTASection — final call-to-action section
 */
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'

export function CTASection() {
  const navigate = useNavigate()

  return (
    <section className="py-20 px-6 bg-gradient-to-t from-[rgba(0,0,0,0.5)] to-transparent">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-pixel text-[16px] md:text-[20px] text-[#ffff55] mb-6" style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.8)' }}>
          Ready to Enter the World?
        </h2>

        <p className="font-terminal text-[8px] text-[#aaffaa] mb-8 leading-relaxed">
          Join thousands of users harnessing the power of specialized AI agents. No credit card required. Start crafting solutions today.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
          <Button
            variant="primary"
            onClick={() => navigate('/login')}
            className="text-[10px] px-8 py-4"
          >
            ▶ CREATE ACCOUNT
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/login')}
            className="text-[10px] px-8 py-4"
          >
            → SIGN IN
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="pt-8 border-t-2 border-[rgba(93,158,50,0.3)]">
          <p className="font-pixel text-[6px] text-[#55ffff] mb-4 uppercase">Built with security in mind</p>
          <div className="flex flex-wrap justify-center gap-8 text-[8px] text-[#aaffaa] font-terminal">
            <div className="flex items-center gap-2">
              <span>🔒</span>
              <span>Bcrypt Password Hashing</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🛡️</span>
              <span>JWT Authentication</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔐</span>
              <span>Secure Database</span>
            </div>
          </div>
        </div>

        {/* Footer version info */}
        <div className="mt-12 pt-8 border-t border-[rgba(93,158,50,0.2)]">
          <p className="font-pixel text-[6px] text-[#5d9e32] opacity-60">CraftAgent v0.2.0 • Minecraft-themed AI Command Center</p>
        </div>
      </div>
    </section>
  )
}
