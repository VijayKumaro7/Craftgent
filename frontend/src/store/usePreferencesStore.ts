/**
 * User preferences store (Zustand).
 * Persists to localStorage for UX continuity.
 * Handles theme and response customization settings.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'dark' | 'light'
export type ResponseFormat = 'detailed' | 'brief' | 'code-only'
export type Tone = 'professional' | 'casual' | 'eli5'
export type CodeLanguage = 'javascript' | 'python' | 'go' | 'rust'
export type OutputLanguage = 'english' | 'spanish' | 'french' | 'german'

interface PreferencesState {
  // Theme
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void

  // Response customization
  responseFormat: ResponseFormat
  setResponseFormat: (format: ResponseFormat) => void

  tone: Tone
  setTone: (tone: Tone) => void

  codeLanguage: CodeLanguage
  setCodeLanguage: (lang: CodeLanguage) => void

  outputLanguage: OutputLanguage
  setOutputLanguage: (lang: OutputLanguage) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      // Theme
      theme: 'dark',
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'dark' ? 'light' : 'dark',
      })),
      setTheme: (theme: Theme) => set({ theme }),

      // Response customization
      responseFormat: 'detailed',
      setResponseFormat: (format) => set({ responseFormat: format }),

      tone: 'professional',
      setTone: (tone) => set({ tone }),

      codeLanguage: 'javascript',
      setCodeLanguage: (lang) => set({ codeLanguage: lang }),

      outputLanguage: 'english',
      setOutputLanguage: (lang) => set({ outputLanguage: lang }),
    }),
    {
      name: 'craftgent-preferences',
      version: 1,
    },
  ),
)
