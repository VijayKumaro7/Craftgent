/**
 * User preferences store (Zustand).
 * Persists to localStorage for UX continuity.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'dark' | 'light'

interface PreferencesState {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'dark' ? 'light' : 'dark',
      })),
      setTheme: (theme: Theme) => set({ theme }),
    }),
    {
      name: 'craftgent-preferences',
      version: 1,
    },
  ),
)
