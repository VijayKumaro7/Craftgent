/**
 * LoginScreen — Minecraft-styled auth gate.
 *
 * Shows login form by default, toggles to register.
 * Uses the same grass/stone/dirt palette as the main UI.
 */
import { useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { SkyBackground } from '@/components/layout/SkyBackground'

interface FieldProps {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  autoFocus?: boolean
}

function McField({ label, type = 'text', value, onChange, disabled, autoFocus }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-pixel text-[7px] text-chat-sys drop-shadow-[1px_1px_0_#000]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        autoFocus={autoFocus}
        className={[
          'w-full bg-[#000000aa] border-[3px] px-3 py-2',
          'border-t-[#555] border-l-[#555] border-b-[#ddd] border-r-[#ddd]',
          'font-terminal text-[20px] text-white placeholder:text-white/30',
          'outline-none focus:border-t-[#888] focus:border-l-[#888]',
          'caret-chat-agent',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ].join(' ')}
      />
    </div>
  )
}

function McButton({
  children,
  onClick,
  disabled,
  variant = 'primary',
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}) {
  const base = [
    'w-full font-pixel text-[8px] py-3 px-4',
    'border-[3px] transition-none select-none',
    'focus:outline-none',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:border-t-[#555] active:border-l-[#555] active:border-b-[#ddd] active:border-r-[#ddd]',
  ]

  const variants = {
    primary: [
      'text-white drop-shadow-[1px_1px_0_#000]',
      'border-t-[#aef060] border-l-[#aef060] border-b-[#2a5a08] border-r-[#2a5a08]',
      disabled ? 'bg-mc-stone-d' : 'bg-mc-grass hover:bg-mc-grass-t',
    ],
    secondary: [
      'text-white/70 drop-shadow-[1px_1px_0_#000]',
      'border-t-[#aaa] border-l-[#aaa] border-b-[#333] border-r-[#333]',
      'bg-mc-stone hover:bg-mc-stone-d',
    ],
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[...base, ...variants[variant]].join(' ')}
    >
      {children}
    </button>
  )
}

export function LoginScreen() {
  const [mode, setMode]         = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const { login, register, isLoading, error, clearError } = useAuthStore()

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) return

    if (mode === 'register') {
      if (password !== confirm) return
      await register(username.trim(), password)
    } else {
      await login(username.trim(), password)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const isInvalid = !username.trim() || !password.trim() ||
    (mode === 'register' && password !== confirm)

  return (
    <>
      <SkyBackground />
      <div className="scanlines fixed inset-0 pointer-events-none" style={{ zIndex: 9995 }} />

      {/* Center panel */}
      <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
        <div
          className="w-[400px] flex flex-col gap-4"
          style={{
            background: 'rgba(0,0,0,0.82)',
            border: '3px solid',
            borderColor: '#fff3 #0008 #0008 #fff3',
            padding: '28px 32px',
            boxShadow: '4px 4px 0 rgba(0,0,0,0.6)',
          }}
          onKeyDown={handleKey}
        >
          {/* Title */}
          <div className="text-center mb-2">
            <div className="font-pixel text-[12px] text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)] leading-relaxed">
              ⛏ CRAFTGENT
            </div>
            <div className="font-pixel text-[6px] text-mc-grass-t mt-1">
              AI Command Center
            </div>
          </div>

          {/* Mode tabs */}
          <div className="flex gap-1">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); clearError() }}
                className={[
                  'flex-1 font-pixel text-[6px] py-2',
                  'border-[2px] transition-none',
                  mode === m
                    ? 'bg-mc-grass border-t-[#aef] border-l-[#aef] border-b-[#2a5] border-r-[#2a5] text-white'
                    : 'bg-[#333] border-t-[#555] border-l-[#555] border-b-[#aaa] border-r-[#aaa] text-white/50 hover:text-white/80',
                ].join(' ')}
              >
                {m === 'login' ? '▶ LOGIN' : '✦ REGISTER'}
              </button>
            ))}
          </div>

          {/* Fields */}
          <McField
            label="USERNAME"
            value={username}
            onChange={setUsername}
            disabled={isLoading}
            autoFocus
          />
          <McField
            label="PASSWORD"
            type="password"
            value={password}
            onChange={setPassword}
            disabled={isLoading}
          />
          {mode === 'register' && (
            <McField
              label="CONFIRM PASSWORD"
              type="password"
              value={confirm}
              onChange={setConfirm}
              disabled={isLoading}
            />
          )}

          {/* Password match indicator */}
          {mode === 'register' && confirm && (
            <div className={`font-pixel text-[6px] ${password === confirm ? 'text-[#5aff5a]' : 'text-mc-redstone'}`}>
              {password === confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="font-pixel text-[6px] text-mc-redstone border border-mc-redstone/30 px-2 py-1.5 bg-mc-redstone/10">
              ✗ {error}
            </div>
          )}

          {/* Submit */}
          <McButton
            onClick={handleSubmit}
            disabled={isLoading || isInvalid}
          >
            {isLoading
              ? '▌▌▌ LOADING...'
              : mode === 'login'
              ? '▶ ENTER WORLD'
              : '✦ CREATE ACCOUNT'
            }
          </McButton>

          {/* Footer hint */}
          <div className="font-pixel text-[5px] text-white/30 text-center leading-relaxed">
            {mode === 'login'
              ? 'No account? Click REGISTER above.'
              : 'Already have an account? Click LOGIN above.'
            }
          </div>
        </div>
      </div>
    </>
  )
}
