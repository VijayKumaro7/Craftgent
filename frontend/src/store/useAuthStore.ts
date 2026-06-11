import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const NOT_CONFIGURED_ERROR =
  'Authentication is not configured on this deployment (missing Supabase settings). ' +
  'Please contact the site administrator.'

interface AuthState {
  email: string | null
  username: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  info: string | null
  /** True when a signed-in session still needs a TOTP code to reach AAL2 */
  mfaRequired: boolean

  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string) => Promise<boolean>
  loginWithGoogle: () => Promise<void>
  verifyMfa: (code: string) => Promise<boolean>
  cancelMfa: () => Promise<void>
  logout: () => Promise<void>
  tryRefresh: () => Promise<boolean>
  clearError: () => void
}

/**
 * A session exists but the user has a verified TOTP factor, so the
 * session must be stepped up from AAL1 to AAL2 before we treat them
 * as authenticated.
 */
async function needsMfaStepUp(): Promise<boolean> {
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (error || !data) return false
  return data.nextLevel === 'aal2' && data.nextLevel !== data.currentLevel
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withDevtools = (import.meta.env.DEV ? devtools : <T>(fn: T) => fn) as any

export const useAuthStore = create<AuthState>()(
  withDevtools(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (set: any) => ({
      email: null,
      username: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      info: null,
      mfaRequired: false,

      login: async (email, password) => {
        if (!isSupabaseConfigured) {
          set({ error: NOT_CONFIGURED_ERROR })
          return false
        }
        set({ isLoading: true, error: null, info: null })
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error || !data.session) {
          set({ isLoading: false, error: error?.message ?? 'Login failed', isAuthenticated: false })
          return false
        }
        if (await needsMfaStepUp()) {
          set({ isLoading: false, mfaRequired: true, isAuthenticated: false })
          return false
        }
        const userEmail = data.user.email ?? email
        const username = data.user.user_metadata?.username ?? userEmail
        set({ email: userEmail, username, isAuthenticated: true, isLoading: false, error: null })
        return true
      },

      verifyMfa: async (code) => {
        set({ isLoading: true, error: null })
        const factors = await supabase.auth.mfa.listFactors()
        const totp = factors.data?.totp.find((f) => f.status === 'verified') ?? factors.data?.totp[0]
        if (factors.error || !totp) {
          set({ isLoading: false, error: 'No authenticator app is enrolled for this account.' })
          return false
        }
        const { data, error } = await supabase.auth.mfa.challengeAndVerify({
          factorId: totp.id,
          code,
        })
        if (error || !data) {
          set({ isLoading: false, error: 'Invalid verification code. Please try again.' })
          return false
        }
        const userEmail = data.user.email ?? null
        const username = data.user.user_metadata?.username ?? userEmail
        set({
          email: userEmail,
          username,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          mfaRequired: false,
        })
        return true
      },

      cancelMfa: async () => {
        await supabase.auth.signOut()
        set({ mfaRequired: false, isAuthenticated: false, error: null, isLoading: false })
      },

      register: async (email, password) => {
        if (!isSupabaseConfigured) {
          set({ error: NOT_CONFIGURED_ERROR })
          return false
        }
        set({ isLoading: true, error: null, info: null })
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: email } },
        })
        if (error) {
          set({ isLoading: false, error: error.message })
          return false
        }
        // signUp returns a session immediately when email confirmation is disabled
        if (data.session) {
          const userEmail = data.user?.email ?? email
          const username = data.user?.user_metadata?.username ?? userEmail
          set({ email: userEmail, username, isAuthenticated: true, isLoading: false, error: null })
          return true
        }
        // Email confirmation required — surface it instead of failing silently
        set({
          isLoading: false,
          error: null,
          info: 'Account created! Check your email to confirm your address, then sign in.',
        })
        return false
      },

      loginWithGoogle: async () => {
        if (!isSupabaseConfigured) {
          set({ error: NOT_CONFIGURED_ERROR })
          return
        }
        set({ isLoading: true, error: null, info: null })
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/login` },
        })
        // On success the browser navigates away to Google; only errors land here
        if (error) set({ isLoading: false, error: error.message })
      },

      logout: async () => {
        await supabase.auth.signOut()
        set({
          email: null,
          username: null,
          isAuthenticated: false,
          error: null,
          info: null,
          mfaRequired: false,
        })
      },

      tryRefresh: async () => {
        if (!isSupabaseConfigured) return false
        const { data } = await supabase.auth.getSession()
        if (!data.session) return false
        if (await needsMfaStepUp()) {
          set({ mfaRequired: true, isAuthenticated: false })
          return false
        }
        const user = data.session.user
        const userEmail = user.email ?? null
        const username = user.user_metadata?.username ?? userEmail
        set({ email: userEmail, username, isAuthenticated: true, mfaRequired: false })
        return true
      },

      clearError: () => set({ error: null, info: null }),
    }),
    { name: 'CraftAuth' }
  )
)
