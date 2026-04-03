import { useEffect } from 'react'
import { usePreferencesStore } from '@/store/usePreferencesStore'

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = usePreferencesStore((s) => s.theme)

  useEffect(() => {
    // Apply theme to document root
    const root = document.documentElement
    if (theme === 'light') {
      root.style.filter = 'invert(1) hue-rotate(180deg)'
      root.style.colorScheme = 'light'
    } else {
      root.style.filter = 'none'
      root.style.colorScheme = 'dark'
    }
  }, [theme])

  return <>{children}</>
}

export function useTheme() {
  return usePreferencesStore((s) => ({
    theme: s.theme,
    toggleTheme: s.toggleTheme,
    setTheme: s.setTheme,
  }))
}
