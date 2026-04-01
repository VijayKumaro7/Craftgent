/**
 * Hotbar — Minecraft-style 9-slot item bar at the bottom.
 * Supports keyboard shortcuts 1–9 to switch slots.
 */
import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'

export function Hotbar() {
  const { inventory, selectedSlot, setSelectedSlot } = useAppStore()
  const slots = inventory.slice(0, 9)

  // Keys 1–9 switch hotbar slots
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const n = parseInt(e.key)
      if (n >= 1 && n <= 9) setSelectedSlot(n - 1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [setSelectedSlot])

  return (
    <div
      className="col-span-3 flex items-center justify-center gap-0 py-1.5 relative"
      style={{ background: 'transparent' }}
    >
      {/* Coord display */}
      <div className="absolute left-3 font-pixel text-[5px] text-white drop-shadow-[1px_1px_0_#000] leading-[2]">
        <div>X: 128</div>
        <div>Y: 64</div>
        <div>Z: -256</div>
      </div>

      {/* Hotbar slots */}
      <div
        className="flex gap-[2px] p-[3px]"
        style={{
          background: '#8b8b8b',
          border: '3px solid',
          borderColor: '#fff #555 #555 #fff',
          boxShadow: '3px 3px 0 rgba(0,0,0,0.6), inset 1px 1px 0 rgba(255,255,255,0.3)',
        }}
      >
        {slots.map((slot, i) => {
          const selected = selectedSlot === i
          return (
            <button
              key={slot.id}
              onClick={() => setSelectedSlot(i)}
              title={slot.label}
              className="relative flex items-center justify-center focus:outline-none"
              style={{
                width: 40,
                height: 40,
                background: '#8b8b8b',
                border: '3px solid',
                borderColor: selected ? '#fff #555 #555 #fff' : '#555 #ddd #ddd #555',
                boxShadow: selected ? 'inset 0 0 0 1px #fff' : 'none',
                imageRendering: 'pixelated',
              }}
              aria-label={`${slot.label} (slot ${i + 1})`}
              aria-pressed={selected}
            >
              <span className="text-[22px] leading-none">{slot.emoji}</span>
              <span
                className="absolute bottom-[1px] right-[2px] font-pixel text-[5px] text-white"
                style={{ textShadow: '1px 1px 0 #000' }}
              >
                {slot.count}
              </span>
              {/* Slot number */}
              <span
                className="absolute top-[1px] left-[2px] font-pixel text-[4px] text-white/40"
              >
                {i + 1}
              </span>
            </button>
          )
        })}
      </div>

      {/* Compass */}
      <div
        className="absolute right-5 w-11 h-11 flex items-center justify-center text-[22px]"
        style={{
          background: 'linear-gradient(135deg,#6a4a1a 0%,#3a2a0a 100%)',
          border: '3px solid',
          borderColor: '#a0703a #3a2010 #3a2010 #a0703a',
          boxShadow: '2px 2px 0 rgba(0,0,0,0.7)',
          animation: 'spin 12s steps(16) infinite',
        }}
        aria-label="Compass"
      >
        🧭
      </div>
    </div>
  )
}
