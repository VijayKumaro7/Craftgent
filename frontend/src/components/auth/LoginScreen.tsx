import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { SkyBackground } from '@/components/layout/SkyBackground'

function validatePasswordStrength(password: string): string[] {
  const errors: string[] = []
  if (password.length < 12) errors.push('At least 12 characters')
  if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter')
  if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter')
  if (!/\d/.test(password)) errors.push('At least one digit')
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('At least one special character (!@#$%)')
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
  autoComplete?: string
}

function AuthField({ label, type = 'text', value, onChange, disabled, autoFocus, placeholder, hint, autoComplete }: FieldProps) {
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
        autoComplete={autoComplete}
        className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm placeholder:text-text-muted outline-none transition-all duration-200 focus:border-accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {hint && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29a7.16 7.16 0 0 1 0-4.58V6.62H1.29a12.04 12.04 0 0 0 0 10.76l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  )
}

/** Step-up screen shown when the account has a TOTP factor enrolled */
function MfaVerifyStep() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const { verifyMfa, cancelMfa, isLoading, error } = useAuthStore()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = code.trim()
    if (trimmed.length < 6) return
    const ok = await verifyMfa(trimmed)
    if (ok) navigate('/chat', { replace: true })
  }

  return (
    <form onSubmit={handleVerify} className="flex flex-col gap-4">
      <div className="text-center">
        <h2 className="text-text-primary font-semibold text-base mb-1">Two-factor authentication</h2>
        <p className="text-text-secondary text-xs">
          Enter the 6-digit code from your authenticator app.
        </p>
      </div>

      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d{6}"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
        disabled={isLoading}
        autoFocus
        placeholder="000000"
        aria-label="Authentication code"
        className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-4 py-3 text-text-primary text-center text-2xl tracking-[0.5em] placeholder:text-text-muted outline-none transition-all duration-200 focus:border-accent-primary disabled:opacity-50"
      />

      {error && (
        <div className="px-3 py-2 rounded-lg bg-error/10 border border-error/20 text-error text-xs">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || code.trim().length < 6}
        className="w-full btn-gradient text-white font-semibold py-2.5 rounded-lg text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
      >
        {isLoading ? 'Verifying…' : 'Verify →'}
      </button>

      <button
        type="button"
        onClick={cancelMfa}
        disabled={isLoading}
        className="w-full text-text-muted text-xs hover:text-text-secondary transition-colors duration-200"
      >
        ← Back to sign in
      </button>
    </form>
  )
}

export function LoginScreen() {
  const navigate = useNavigate()
  const [mode, setMode]     = useState<'login' | 'register'>('login')
  const [email, setEmail]   = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const {
    login, register, loginWithGoogle,
    isLoading, error, info, clearError,
    isAuthenticated, mfaRequired,
  } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) navigate('/chat', { replace: true })
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()
    if (!trimmedEmail || !trimmedPassword) return
    let success = false
    if (mode === 'register') {
      if (trimmedPassword !== confirm.trim()) return
      success = await register(trimmedEmail, trimmedPassword)
      // Email confirmation required — point the user at the sign-in tab
      if (!success && useAuthStore.getState().info) {
        setMode('login')
        setPassword('')
        setConfirm('')
      }
    } else {
      success = await login(trimmedEmail, trimmedPassword)
    }
    if (success) navigate('/chat', { replace: true })
  }

  const passwordValidationErrors = mode === 'register' && password ? validatePasswordStrength(password) : []
  const isInvalid =
    !email.trim() ||
    !password.trim() ||
    (mode === 'register' && password.trim() !== confirm.trim()) ||
    (mode === 'register' && passwordValidationErrors.length > 0)

  return (
    <>
      <SkyBackground />

      <div className="fixed inset-0 flex items-center justify-center px-4" style={{ zIndex: 10 }}>
        <div className="w-full max-w-sm bg-bg-secondary border border-border-default rounded-2xl p-8 animate-scale-in">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl btn-gradient flex items-center justify-center text-xl font-bold text-white mx-auto mb-4">
              CG
            </div>
            <h1 className="text-text-primary font-bold text-xl mb-1">Craftgent</h1>
            <p className="text-text-secondary text-sm">Multi-Agent AI Platform</p>
          </div>

          {mfaRequired ? (
            <MfaVerifyStep />
          ) : (
            <>
              {/* Mode tabs */}
              <div className="flex gap-1 p-1 bg-bg-secondary rounded-lg mb-6">
                {(['login', 'register'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
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

              {/* Google OAuth */}
              <button
                type="button"
                onClick={loginWithGoogle}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-bg-primary border border-border-default rounded-lg py-2.5 text-text-primary text-sm font-medium hover:bg-bg-elevated transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <GoogleIcon />
                {mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-border-subtle" />
                <span className="text-text-muted text-xs uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-border-subtle" />
              </div>

              <form onSubmit={handleSubmit}>
                {/* Fields */}
                <div className="flex flex-col gap-4">
                  <AuthField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    disabled={isLoading}
                    autoFocus
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  <div>
                    <AuthField
                      label="Password"
                      type="password"
                      value={password}
                      onChange={setPassword}
                      disabled={isLoading}
                      placeholder="Enter your password"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
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
                      autoComplete="new-password"
                    />
                  )}
                </div>

                {/* Password match */}
                {mode === 'register' && confirm && (
                  <p className={`mt-2 text-xs ${password === confirm ? 'text-success' : 'text-error'}`}>
                    {password === confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}

                {/* Error / info */}
                {error && (
                  <div className="mt-3 px-3 py-2 rounded-lg bg-error/10 border border-error/20 text-error text-xs">
                    {error}
                  </div>
                )}
                {info && (
                  <div className="mt-3 px-3 py-2 rounded-lg bg-success/10 border border-success/20 text-success text-xs">
                    {info}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
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
              </form>

              {/* Footer hint */}
              <p className="mt-4 text-center text-text-muted text-xs">
                {mode === 'login'
                  ? "Don't have an account? Click Register above."
                  : 'Already have an account? Click Sign in above.'
                }
              </p>
            </>
          )}
        </div>
      </div>
    </>
  )
}
