/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      colors: {
        bg: {
          primary:  '#09090e',
          secondary: '#12121a',
          card:     'rgba(18,18,26,0.85)',
          elevated: '#1a1a27',
          light:    '#fafbfc',
          'light-secondary': '#f1f5f9',
          'light-elevated': '#ffffff',
        },
        accent: {
          primary:  '#7c3aed',
          hover:    '#8b5cf6',
          secondary: '#a78bfa',
          bright:   '#8b5cf6',
        },
        text: {
          primary:   '#f8fafc',
          secondary: '#cbd5e1',
          muted:     '#64748b',
          accent:    '#a78bfa',
          'dark-primary': '#09090e',
          'dark-secondary': '#475569',
          'dark-muted': '#94a3b8',
        },
        border: {
          subtle:  'rgba(124,58,237,0.08)',
          default: 'rgba(124,58,237,0.15)',
          strong:  'rgba(124,58,237,0.3)',
          light:   'rgba(124,58,237,0.1)',
        },
        success: '#059669',
        warning: '#f97316',
        error:   '#dc2626',
        agent: {
          nexus:      '#7c3aed',
          alex:       '#059669',
          vortex:     '#a78bfa',
          researcher: '#f97316',
        },
        chat: {
          sys:    '#cbd5e1',
          agent:  '#a78bfa',
          user:   '#059669',
          whisper: '#a78bfa',
        },
      },
      boxShadow: {
        'sm':       '0 1px 2px 0 rgba(0,0,0,0.05)',
        'md':       '0 4px 6px -1px rgba(0,0,0,0.1)',
        'lg':       '0 10px 15px -3px rgba(0,0,0,0.15)',
        'xl':       '0 20px 25px -5px rgba(0,0,0,0.2)',
        'card':     '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
        'card-hover':'0 10px 15px -3px rgba(124,58,237,0.15)',
        'refined':  '0 4px 12px rgba(0,0,0,0.12)',
        'light-sm': '0 1px 2px 0 rgba(0,0,0,0.05)',
        'light-md': '0 2px 4px 0 rgba(0,0,0,0.08)',
      },
      borderWidth: { '3': '3px' },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        subtlePulse: {
          '0%,100%': { opacity: '1' },
          '50%':      { opacity: '0.8' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        typingDot: {
          '0%,60%,100%': { transform: 'translateY(0)', opacity: '0.4' },
          '30%':           { transform: 'translateY(-3px)', opacity: '1' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        spinSlow: {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        blink: {
          '0%,49%':   { opacity: '1' },
          '50%,100%': { opacity: '0' },
        },
      },
      animation: {
        'fade-in':      'fadeIn 0.4s ease-out both',
        'slide-up':     'slideUp 0.5s ease-out both',
        'slide-down':   'slideDown 0.3s ease-out both',
        'slide-in-left':'slideInLeft 0.3s ease-out both',
        'scale-in':     'scaleIn 0.2s ease-out both',
        'subtle-pulse': 'subtlePulse 2s ease-in-out infinite',
        'float':        'float 2s ease-in-out infinite',
        'typing-dot':   'typingDot 1.2s ease-in-out infinite',
        'shimmer':      'shimmer 2s linear infinite',
        'spin-slow':    'spinSlow 8s linear infinite',
        'blink':        'blink 0.7s steps(1) infinite',
      },
    },
  },
  plugins: [],
}
