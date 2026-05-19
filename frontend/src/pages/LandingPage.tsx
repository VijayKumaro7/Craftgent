import { SkyBackground } from '@/components/layout/SkyBackground'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { AgentShowcase } from '@/components/landing/AgentShowcase'
import { CTASection } from '@/components/landing/CTASection'

export function LandingPage() {
  return (
    <>
      <SkyBackground />

      <div
        className="relative w-full"
        style={{ zIndex: 10, overflowY: 'auto', height: '100vh' }}
      >
        <LandingHeader />

        <main>
          <HeroSection />
          <FeaturesSection />
          <AgentShowcase />
          <CTASection />
        </main>
      </div>
    </>
  )
}
