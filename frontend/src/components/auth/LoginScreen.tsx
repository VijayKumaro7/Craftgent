import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { SkyBackground } from '@/components/layout/SkyBackground'

function validatePasswordStrength(password: string, username: string = ''): string[] {
  const errors: string[] = []
  if (password.length < 12) errors.push('At least 12 characters')
  if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter')
  if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter')
  if (!/\d/.test(password)) errors.push('At least one digit')
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('At least one special character (!@#$%)')
  if (username && password.toLowerCase().includes(username.toLowerCase())) errors.push('Cannot contain username')
  return errors
}

interface FieldProps {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  autoFocus?: boolean
  placeholder?: string
  hint?: string
}

function AuthField({ label, type = 'text', value, onChange, disabled, autoFocus, placeholder, hint }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-text-secondary text-xs font-medium uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm placeholder:text-text-muted outline-none transition-all duration-200 focus:border-accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {hint && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  )
}

export function LoginScreen() {
  const navigate = useNavigate()
  const [mode, setMode]         = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const { login, register, isLoading, error, clearError, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) navigate('/chat', { replace: true })
  }, [isAuthenticated, navigate])

  const handleSubmit = async () => {
    const trimmedUsername = username.trim()
    const trimmedPassword = password.trim()
    if (!trimmedUsername || !trimmedPassword) return
    let success = false
    if (mode === 'register') {
      if (trimmedPassword !== confirm.trim()) return
      success = await register(trimmedUsername, trimmedPassword)
    } else {
      success = await login(trimmedUsername, trimmedPassword)
    }
    if (success) navigate('/chat', { replace: true })
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const passwordValidationErrors = mode === 'register' && password ? validatePasswordStrength(password, username) : []
  const isInvalid =
    !username.trim() ||
    !password.trim() ||
    (mode === 'register' && password.trim() !== confirm.trim()) ||
    (mode === 'register' && passwordValidationErrors.length > 0)

  return (
    <>
      <SkyBackground />

      <div className="fixed inset-0 flex items-center justify-center px-4" style={{ zIndex: 10 }}>
        <div
          className="w-full max-w-sm bg-bg-secondary border border-border-default rounded-2xl p-8 animate-scale-in"
          onKeyDown={handleKey}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl btn-gradient flex items-center justify-center text-xl font-bold text-white mx-auto mb-4">
              CG
            </div>
            <h1 className="text-text-primary font-bold text-xl mb-1">Craftgent</h1>
            <p className="text-text-secondary text-sm">Multi-Agent AI Platform</p>
          </div>

          {/* Mode tabs */}
          <div className="flex gap-1 p-1 bg-bg-secondary rounded-lg mb-6">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); clearError() }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  mode === m
                    ? 'bg-accent-primary text-white shadow-md'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {m === 'login' ? 'Sign in' : 'Register'}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-4">
            <AuthField
              label="Username"
              value={username}
              onChange={setUsername}
              disabled={isLoading}
              autoFocus
              placeholder="Enter your username"
              hint="3-32 characters (whitespace trimmed)"
            />
            <div>
              <AuthField
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                disabled={isLoading}
                placeholder="Enter your password"
              />
              {mode === 'register' && password && (
                <div className="mt-2 p-2 bg-bg-secondary border border-border-subtle rounded text-xs space-y-1" role="status" aria-live="polite" aria-label="Password validation status">
                  {passwordValidationErrors.length === 0 ? (
                    <p className="text-success">✓ Password meets all requirements</p>
                  ) : (
                    <>
                      <p className="text-text-muted font-medium mb-1">Password requirements:</p>
                      <ul className="list-none space-y-1" role="list" aria-label="Missing password requirements">
                        {passwordValidationErrors.map((req) => (
                          <li key={req} className="text-error" role="listitem">✗ {req}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </div>
            {mode === 'register' && (
              <AuthField
                label="Confirm Password"
                type="password"
                value={confirm}
                onChange={setConfirm}
                disabled={isLoading}
                placeholder="Confirm your password"
              />
            )}
          </div>

          {/* Password match */}
          {mode === 'register' && confirm && (
            <p className={`mt-2 text-xs ${password === confirm ? 'text-success' : 'text-error'}`}>
              {password === confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
            </p>
          )}

          {/* Error */}
          {error && (
            <div className="mt-3 px-3 py-2 rounded-lg bg-error/10 border border-error/20 text-error text-xs">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || isInvalid}
            className="mt-6 w-full btn-gradient text-white font-semibold py-2.5 rounded-lg text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
          >
            {isLoading
              ? 'Loading…'
              : mode === 'login'
              ? 'Sign in →'
              : 'Create account →'
            }
          </button>

          {/* Footer hint */}
          <p className="mt-4 text-center text-text-muted text-xs">
            {mode === 'login'
              ? "Don't have an account? Click Register above."
              : 'Already have an account? Click Sign in above.'
            }
          </p>
        </div>
      </div>
    </>
  )
}
