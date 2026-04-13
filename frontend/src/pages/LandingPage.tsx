/**
 * LandingPage — public landing page showcasing CraftAgent features
 */
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
      <div className="scanlines fixed inset-0 pointer-events-none" style={{ zIndex: 9995 }} />

      <div className="relative min-h-screen w-full" style={{ zIndex: 10 }}>
        <LandingHeader />

        <main className="flex flex-col">
          <HeroSection />
          <FeaturesSection />
          <AgentShowcase />
          <CTASection />
        </main>
      </div>
    </>
  )
}
