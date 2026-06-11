import React, { useCallback, useEffect, useState } from 'react'
import { X, ShieldCheck, ShieldOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface EnrollData {
  factorId: string
  qrCode: string
  secret: string
}

interface TwoFactorSetupProps {
  onClose: () => void
}

/**
 * TwoFactorSetup — modal for enrolling / removing a TOTP authenticator
 * factor (Google Authenticator, Authy, 1Password, …) via Supabase MFA.
 */
export function TwoFactorSetup({ onClose }: TwoFactorSetupProps) {
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enrolledFactorId, setEnrolledFactorId] = useState<string | null>(null)
  const [enroll, setEnroll] = useState<EnrollData | null>(null)
  const [code, setCode] = useState('')

  const refreshFactors = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.mfa.listFactors()
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    const verified = data.totp.find((f) => f.status === 'verified')
    setEnrolledFactorId(verified?.id ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    refreshFactors()
  }, [refreshFactors])

  const startEnrollment = async () => {
    setBusy(true)
    setError(null)
    // Clean up stale unverified factors so re-enrollment doesn't fail
    const { data: existing } = await supabase.auth.mfa.listFactors()
    for (const f of existing?.totp.filter((f) => f.status !== 'verified') ?? []) {
      await supabase.auth.mfa.unenroll({ factorId: f.id })
    }
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Authenticator app',
    })
    if (error || !data) {
      setError(error?.message ?? 'Could not start 2FA enrollment')
      setBusy(false)
      return
    }
    setEnroll({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret })
    setCode('')
    setBusy(false)
  }

  const confirmEnrollment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enroll || code.trim().length < 6) return
    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: enroll.factorId,
      code: code.trim(),
    })
    if (error) {
      setError('Invalid code — check your authenticator app and try again.')
      setBusy(false)
      return
    }
    setEnroll(null)
    setCode('')
    setBusy(false)
    await refreshFactors()
  }

  const disable2fa = async () => {
    if (!enrolledFactorId) return
    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.mfa.unenroll({ factorId: enrolledFactorId })
    if (error) {
      setError(error.message)
      setBusy(false)
      return
    }
    setBusy(false)
    await refreshFactors()
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 px-4"
      style={{ zIndex: 50 }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-bg-secondary border border-border-default rounded-2xl p-6 animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-label="Two-factor authentication settings"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-text-primary font-semibold text-base">Two-factor authentication</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all duration-200"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <p className="text-text-muted text-sm py-6 text-center">Loading…</p>
        ) : enroll ? (
          /* Enrollment: scan QR + confirm code */
          <form onSubmit={confirmEnrollment} className="flex flex-col gap-4">
            <p className="text-text-secondary text-xs">
              Scan this QR code with your authenticator app (Google Authenticator, Authy,
              1Password, …), then enter the 6-digit code it shows.
            </p>
            <div className="bg-white rounded-lg p-3 mx-auto">
              <img src={enroll.qrCode} alt="2FA QR code" className="w-44 h-44" />
            </div>
            <div className="text-center">
              <p className="text-text-muted text-xs mb-1">Or enter this key manually:</p>
              <code className="text-text-primary text-xs break-all select-all bg-bg-primary border border-border-subtle rounded px-2 py-1 inline-block">
                {enroll.secret}
              </code>
            </div>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              disabled={busy}
              autoFocus
              placeholder="000000"
              aria-label="Verification code"
              className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-center text-xl tracking-[0.4em] placeholder:text-text-muted outline-none transition-all duration-200 focus:border-accent-primary disabled:opacity-50"
            />
            {error && (
              <div className="px-3 py-2 rounded-lg bg-error/10 border border-error/20 text-error text-xs">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={busy || code.trim().length < 6}
              className="w-full btn-gradient text-white font-semibold py-2.5 rounded-lg text-sm shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? 'Verifying…' : 'Verify & enable'}
            </button>
            <button
              type="button"
              onClick={() => { setEnroll(null); setError(null) }}
              disabled={busy}
              className="w-full text-text-muted text-xs hover:text-text-secondary transition-colors duration-200"
            >
              Cancel
            </button>
          </form>
        ) : enrolledFactorId ? (
          /* Already enabled */
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-success/10 border border-success/20">
              <ShieldCheck className="w-5 h-5 text-success shrink-0" />
              <p className="text-success text-sm">
                Two-factor authentication is <strong>enabled</strong>. You&apos;ll be asked for a
                code from your authenticator app when signing in.
              </p>
            </div>
            {error && (
              <div className="px-3 py-2 rounded-lg bg-error/10 border border-error/20 text-error text-xs">
                {error}
              </div>
            )}
            <button
              onClick={disable2fa}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 border border-error/30 text-error rounded-lg py-2.5 text-sm font-medium hover:bg-error/10 transition-all duration-200 disabled:opacity-50"
            >
              <ShieldOff className="w-4 h-4" />
              {busy ? 'Disabling…' : 'Disable two-factor authentication'}
            </button>
          </div>
        ) : (
          /* Not yet enabled */
          <div className="flex flex-col gap-4">
            <p className="text-text-secondary text-sm">
              Add an extra layer of security to your account. After enabling, you&apos;ll need a
              code from an authenticator app each time you sign in.
            </p>
            {error && (
              <div className="px-3 py-2 rounded-lg bg-error/10 border border-error/20 text-error text-xs">
                {error}
              </div>
            )}
            <button
              onClick={startEnrollment}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 btn-gradient text-white font-semibold py-2.5 rounded-lg text-sm shadow-md transition-all duration-200 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              {busy ? 'Starting…' : 'Enable two-factor authentication'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
