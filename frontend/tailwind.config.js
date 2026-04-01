/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Minecraft pixel font for headings/UI chrome
        pixel: ['"Press Start 2P"', 'monospace'],
        // VT323 for chat text — readable at small sizes
        terminal: ['VT323', 'monospace'],
      },
      colors: {
        // Minecraft block palette
        mc: {
          grass:    '#5d9e32',
          'grass-d': '#3e6b1f',
          'grass-t': '#6abf38',
          dirt:     '#866043',
          'dirt-d': '#5c3d1e',
          stone:    '#8b8b8b',
          'stone-d': '#5a5a5a',
          wood:     '#9f7f3a',
          sand:     '#e0c97a',
          coal:     '#2a2a2a',
          diamond:  '#4de8e8',
          redstone: '#e02020',
          gold:     '#f5c842',
          lapis:    '#3050c0',
          // UI panels
          panel:    'rgba(0,0,0,0.72)',
          'panel-light': 'rgba(0,0,0,0.55)',
          'slot-bg': '#8b8b8b',
          'slot-dark': '#555555',
        },
        // Chat colours
        chat: {
          sys:    '#ffff55',
          agent:  '#55ffff',
          user:   '#aaffaa',
          whisper: '#cc88ff',
        },
      },
      boxShadow: {
        // Minecraft inset bevel — light top-left, dark bottom-right
        'mc-raised': 'inset 1px 1px 0 rgba(255,255,255,0.3), inset -1px -1px 0 rgba(0,0,0,0.5)',
        'mc-sunken': 'inset -1px -1px 0 rgba(255,255,255,0.3), inset 1px 1px 0 rgba(0,0,0,0.5)',
        'mc-slot':   'inset 2px 2px 0 #333, inset -2px -2px 0 #ccc',
      },
      borderWidth: {
        '3': '3px',
      },
      spacing: {
        'slot': '40px',   // standard hotbar slot size
        'head': '32px',   // agent pixel head
      },
    },
  },
  plugins: [],
}
