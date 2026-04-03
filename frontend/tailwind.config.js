/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Minecraft-inspired palette
        cobalt: '#1e40af',
        emerald: '#059669',
        pixel: {
          bg: '#0f0f0f',
          border: '#1a1a1a',
          text: '#e0e0e0',
          accent: '#3b82f6',
        },
        agent: {
          nexus: '#3b82f6',   // Blue (Orchestrator)
          alex: '#10b981',     // Green (Code Warrior)
          vortex: '#8b5cf6',   // Purple (Data Creeper)
        },
      },
      fontFamily: {
        mono: ['"Courier New"', 'monospace'],
        pixel: ['"Press Start 2P"', 'cursive'],
      },
      fontSize: {
        xs: ['0.75rem', '1rem'],
        sm: ['0.875rem', '1.25rem'],
        base: ['1rem', '1.5rem'],
        lg: ['1.125rem', '1.75rem'],
        xl: ['1.25rem', '1.75rem'],
      },
      spacing: {
        '1px': '1px',
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        bounce: 'bounce 1s infinite',
        shimmer: 'shimmer 2s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      backgroundColor: {
        primary: 'var(--color-bg-primary, #0f0f0f)',
        secondary: 'var(--color-bg-secondary, #1a1a1a)',
      },
      textColor: {
        primary: 'var(--color-text-primary, #e0e0e0)',
        secondary: 'var(--color-text-secondary, #a0a0a0)',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
