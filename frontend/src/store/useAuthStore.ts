/**
 * Auth store — manages JWT tokens and user identity.
 *
 * Tokens are stored in memory (not localStorage) for XSS safety.
 * The refresh token lives in an httpOnly cookie managed by the browser.
 * On hard refresh, we try /api/auth/refresh to restore the session.
 */
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { apiClient } from '@/api/client'

interface AuthState {
  accessToken: string | null
  username: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  login: (username: string, password: string) => Promise<boolean>
  register: (username: string, password: string) => Promise<boolean>
  logout: () => void
  tryRefresh: () => Promise<boolean>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      accessToken: null,
      username: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username, password) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await apiClient.post('/api/auth/login', { username, password })
          set({
            accessToken: data.access_token,
            username,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          // Set the token on the axios client for subsequent requests
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`
          return true
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { detail?: string } } })
            ?.response?.data?.detail ?? 'Login failed'
          set({ isLoading: false, error: msg, isAuthenticated: false })
          return false
        }
      },

      register: async (username, password) => {
        set({ isLoading: true, error: null })
        try {
          await apiClient.post('/api/auth/register', { username, password })
          // Auto-login after register
          return get().login(username, password)
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { detail?: string } } })
            ?.response?.data?.detail ?? 'Registration failed'
          set({ isLoading: false, error: msg })
          return false
        }
      },

      logout: () => {
        delete apiClient.defaults.headers.common['Authorization']
        set({ accessToken: null, username: null, isAuthenticated: false, error: null })
      },

      tryRefresh: async () => {
        try {
          const { data } = await apiClient.post('/api/auth/refresh')
          const { data: me } = await apiClient.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${data.access_token}` },
          })
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`
          set({
            accessToken: data.access_token,
            username: me.username,
            isAuthenticated: true,
          })
          return true
        } catch {
          return false
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'CraftAuth' }
  )
)
