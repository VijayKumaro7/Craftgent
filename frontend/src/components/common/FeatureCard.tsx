/**
 * FeatureCard — reusable feature highlight card for landing page
 */
import { ReactNode } from 'react'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div
      className="p-6 bg-[rgba(0,0,0,0.72)] border-3 border-[#5d9e32] transition-all duration-300 hover:border-[#6abf38] hover:shadow-lg"
      style={{
        boxShadow: '2px 2px 0 rgba(0,0,0,0.8)',
        textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
      }}
    >
      <div className="text-4xl mb-4 animate-pulse">{icon}</div>
      <h3 className="font-pixel text-[10px] text-[#5d9e32] mb-3 uppercase">{title}</h3>
      <p className="font-terminal text-[8px] text-[#aaffaa] leading-relaxed">{description}</p>
    </div>
  )
}
