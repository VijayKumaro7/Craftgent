import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

interface AuthState {
  email: string | null
  username: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  tryRefresh: () => Promise<boolean>
  clearError: () => void
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

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error || !data.session) {
          set({ isLoading: false, error: error?.message ?? 'Login failed', isAuthenticated: false })
          return false
        }
        const userEmail = data.user.email ?? email
        const username = data.user.user_metadata?.username ?? userEmail
        set({ email: userEmail, username, isAuthenticated: true, isLoading: false, error: null })
        return true
      },

      register: async (email, password) => {
        set({ isLoading: true, error: null })
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
        // Email confirmation required — tell the user
        set({ isLoading: false, error: null })
        return true
      },

      logout: async () => {
        await supabase.auth.signOut()
        set({ email: null, username: null, isAuthenticated: false, error: null })
      },

      tryRefresh: async () => {
        const { data } = await supabase.auth.getSession()
        if (!data.session) return false
        const user = data.session.user
        const userEmail = user.email ?? null
        const username = user.user_metadata?.username ?? userEmail
        set({ email: userEmail, username, isAuthenticated: true })
        return true
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'CraftAuth' }
  )
)
