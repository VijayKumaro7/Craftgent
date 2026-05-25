import { ReactNode } from 'react'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-bg-secondary border border-border-subtle rounded-xl p-6 group cursor-default transition-all duration-300 hover:border-border-default hover:shadow-md">
      <div className="text-3xl mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
        {icon}
      </div>
      <h3 className="text-text-primary font-semibold text-base mb-2 group-hover:text-accent-hover transition-colors duration-200">
        {title}
      </h3>
      <p className="text-text-secondary text-sm leading-relaxed">
        {description}
      </p>
    </div>
  )
}
