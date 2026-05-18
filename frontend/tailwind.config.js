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
          primary:  '#0a0a0f',
          secondary: '#111827',
          card:     'rgba(17,24,39,0.8)',
          elevated: '#1a1f2e',
        },
        accent: {
          primary:  '#6366f1',
          hover:    '#818cf8',
          secondary: '#a855f7',
          cyan:     '#06b6d4',
        },
        text: {
          primary:   '#f1f5f9',
          secondary: '#94a3b8',
          muted:     '#475569',
          accent:    '#818cf8',
        },
        border: {
          subtle:  'rgba(99,102,241,0.12)',
          default: 'rgba(99,102,241,0.3)',
          strong:  'rgba(99,102,241,0.6)',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error:   '#ef4444',
        agent: {
          nexus:      '#6366f1',
          alex:       '#10b981',
          vortex:     '#a855f7',
          researcher: '#f59e0b',
        },
        // kept for WS/chat compatibility
        chat: {
          sys:    '#94a3b8',
          agent:  '#818cf8',
          user:   '#10b981',
          whisper: '#a855f7',
        },
      },
      boxShadow: {
        'glow-sm':  '0 0 10px rgba(99,102,241,0.2)',
        'glow-md':  '0 0 20px rgba(99,102,241,0.3)',
        'glow-lg':  '0 0 40px rgba(99,102,241,0.4)',
        'glow-cyan':'0 0 20px rgba(6,182,212,0.3)',
        'glow-purple':'0 0 20px rgba(168,85,247,0.3)',
        'card':     '0 4px 6px -1px rgba(0,0,0,0.3),0 2px 4px -1px rgba(0,0,0,0.2)',
        'card-hover':'0 10px 25px -3px rgba(0,0,0,0.4),0 4px 6px -2px rgba(0,0,0,0.1)',
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
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 10px rgba(99,102,241,0.2)' },
          '50%':      { boxShadow: '0 0 30px rgba(99,102,241,0.5)' },
        },
        gradientShift: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        typingDot: {
          '0%,60%,100%': { transform: 'translateY(0)', opacity: '0.3' },
          '30%':           { transform: 'translateY(-5px)', opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        orbFloat: {
          '0%':   { transform: 'translate(0,0) scale(1)' },
          '33%':  { transform: 'translate(30px,-30px) scale(1.05)' },
          '66%':  { transform: 'translate(-20px,20px) scale(0.95)' },
          '100%': { transform: 'translate(0,0) scale(1)' },
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
        'slide-in-left':'slideInLeft 0.3s ease-out both',
        'scale-in':     'scaleIn 0.2s ease-out both',
        'glow-pulse':   'glowPulse 2s ease-in-out infinite',
        'gradient-shift':'gradientShift 4s ease infinite',
        'float':        'float 3s ease-in-out infinite',
        'typing-dot':   'typingDot 1.2s ease-in-out infinite',
        'shimmer':      'shimmer 2s linear infinite',
        'spin-slow':    'spinSlow 8s linear infinite',
        'orb-float':    'orbFloat 8s ease-in-out infinite',
        'blink':        'blink 0.7s steps(1) infinite',
      },
    },
  },
  plugins: [],
}
