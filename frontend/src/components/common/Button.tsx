import { ReactNode } from 'react'

interface ButtonProps {
  onClick?: () => void
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export function Button({
  onClick,
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/60 select-none'

  const variants: Record<string, string> = {
    primary:
      'btn-gradient text-white shadow-glow-sm hover:shadow-glow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    secondary:
      'bg-bg-elevated border border-border-default text-text-primary hover:border-accent-primary hover:shadow-glow-sm disabled:opacity-50 disabled:cursor-not-allowed',
    ghost:
      'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed',
    outline:
      'bg-transparent border border-accent-primary text-accent-primary hover:bg-accent-primary/10 hover:shadow-glow-sm disabled:opacity-50 disabled:cursor-not-allowed',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
