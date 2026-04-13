/**
 * Button — Minecraft-styled button with pixel art aesthetic
 */
import { ReactNode } from 'react'

interface ButtonProps {
  onClick?: () => void
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
  disabled?: boolean
}

export function Button({ onClick, children, variant = 'primary', className = '', disabled = false }: ButtonProps) {
  const variants = {
    primary: 'bg-[#5d9e32] hover:bg-[#6abf38] active:bg-[#3e6b1f] border-3 border-[#6abf38] text-white font-pixel',
    secondary: 'bg-[#3e6b1f] hover:bg-[#5d9e32] border-3 border-[#5d9e32] text-white font-pixel',
    ghost: 'bg-transparent hover:bg-[rgba(93,158,50,0.2)] border-3 border-[#5d9e32] text-[#aaffaa] font-pixel',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 transition-all duration-200 hover:shadow-lg active:shadow-inner ${variants[variant]} ${className}`}
      style={{
        boxShadow: disabled ? 'none' : '2px 2px 0 rgba(0,0,0,0.8)',
        textShadow: '2px 2px 0 rgba(0,0,0,0.8)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  )
}
