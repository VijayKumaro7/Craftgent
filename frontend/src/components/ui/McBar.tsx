/**
 * McBar — Minecraft-style coloured progress bar.
 * Used for HP, MP, XP, quest progress.
 */
interface McBarProps {
  value: number      // 0–100
  variant?: 'hp' | 'mp' | 'xp' | 'quest' | 'gold'
  className?: string
  animate?: boolean
}

const VARIANT_COLORS: Record<NonNullable<McBarProps['variant']>, string> = {
  hp:    '#e02020',
  mp:    '#3050c0',
  xp:    '#5aff5a',
  quest: '#5d9e32',
  gold:  '#f5c842',
}

export function McBar({ value, variant = 'hp', className = '', animate = false }: McBarProps) {
  const color = VARIANT_COLORS[variant]
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div
      className={`relative h-[5px] bg-[#3a0000] border border-black overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full transition-[width] ${animate ? 'duration-500' : 'duration-0'}`}
        style={{ width: `${clamped}%`, background: color }}
      />
    </div>
  )
}
