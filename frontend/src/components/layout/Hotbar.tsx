import { useEffect, useCallback, useMemo, memo } from 'react'
import { useAppStore } from '@/store/useAppStore'

function HotbarComponent() {
  const { inventory, selectedSlot, setSelectedSlot } = useAppStore(s => ({
    inventory:       s.inventory,
    selectedSlot:    s.selectedSlot,
    setSelectedSlot: s.setSelectedSlot,
  }))
  const slots = useMemo(() => inventory.slice(0, 9), [inventory])

  const handleKey = useCallback((e: KeyboardEvent) => {
    const n = parseInt(e.key)
    if (n >= 1 && n <= 9) setSelectedSlot(n - 1)
  }, [setSelectedSlot])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  return (
    <div
      className="col-span-3 flex items-center justify-center py-2 glass-strong border-t border-border-subtle"
      style={{ minHeight: 60 }}
    >
      {/* Slot bar */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 glass rounded-xl">
        {slots.map((slot, i) => {
          const selected = selectedSlot === i
          return (
            <button
              key={slot.id}
              onClick={() => setSelectedSlot(i)}
              title={slot.label}
              className={`relative flex items-center justify-center rounded-lg transition-all duration-150 focus:outline-none ${
                selected
                  ? 'shadow-glow-sm'
                  : 'hover:bg-white/5'
              }`}
              style={{
                width: 44,
                height: 44,
                background: selected
                  ? 'rgba(99,102,241,0.15)'
                  : 'rgba(17,24,39,0.5)',
                border: selected
                  ? '1px solid rgba(99,102,241,0.5)'
                  : '1px solid rgba(99,102,241,0.1)',
              }}
              aria-label={`${slot.label} (key ${i + 1})`}
              aria-pressed={selected}
            >
              <span className="text-xl leading-none">{slot.emoji}</span>
              {/* Count */}
              <span className="absolute bottom-0.5 right-1 text-[9px] text-text-muted font-mono">
                {slot.count}
              </span>
              {/* Slot number */}
              <span className="absolute top-0.5 left-1 text-[9px] text-text-muted">
                {i + 1}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export const Hotbar = memo(HotbarComponent)
