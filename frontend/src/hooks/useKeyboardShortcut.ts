/**
 * useKeyboardShortcut — Easy keyboard shortcut handling
 * Registers keyboard events and provides accessibility helpers
 */
import { useEffect } from 'react'

export type KeyModifier = 'ctrl' | 'alt' | 'shift' | 'meta'

interface ShortcutOptions {
  modifiers?: KeyModifier[]
  preventDefault?: boolean
  stopPropagation?: boolean
}

/**
 * Hook to register a keyboard shortcut
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: ShortcutOptions = {}
) {
  const { modifiers = [], preventDefault = true, stopPropagation = true } = options

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if key matches (case-insensitive)
      if (event.key.toLowerCase() !== key.toLowerCase()) {
        return
      }

      // Check if all required modifiers are pressed
      const ctrlPressed = event.ctrlKey || event.metaKey
      const altPressed = event.altKey
      const shiftPressed = event.shiftKey

      const requiredCtrl = modifiers.includes('ctrl') || modifiers.includes('meta')
      const requiredAlt = modifiers.includes('alt')
      const requiredShift = modifiers.includes('shift')

      // Verify modifiers match
      if (requiredCtrl !== ctrlPressed) return
      if (requiredAlt !== altPressed) return
      if (requiredShift !== shiftPressed) return

      // All conditions met - call callback
      if (preventDefault) event.preventDefault()
      if (stopPropagation) event.stopPropagation()
      callback()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [key, callback, modifiers, preventDefault, stopPropagation])
}

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(key: string, modifiers: KeyModifier[] = []): string {
  const parts: string[] = []

  if (modifiers.includes('ctrl')) parts.push('Ctrl')
  if (modifiers.includes('alt')) parts.push('Alt')
  if (modifiers.includes('shift')) parts.push('Shift')
  if (modifiers.includes('meta')) parts.push('Cmd')

  parts.push(key.toUpperCase())

  return parts.join(' + ')
}

/**
 * Common shortcuts registry
 */
export const COMMON_SHORTCUTS = {
  SUBMIT_MESSAGE: { key: 'Enter', modifiers: [] as KeyModifier[] },
  SEND_WITH_SHIFT: { key: 'Enter', modifiers: ['shift'] as KeyModifier[] },
  FOCUS_INPUT: { key: 'm', modifiers: ['ctrl'] as KeyModifier[] },
  CLEAR_CHAT: { key: 'l', modifiers: ['ctrl'] as KeyModifier[] },
  TOGGLE_SIDEBAR: { key: 'b', modifiers: ['ctrl'] as KeyModifier[] },
  OPEN_SETTINGS: { key: ',', modifiers: ['ctrl'] as KeyModifier[] },
  SEARCH: { key: 'k', modifiers: ['ctrl'] as KeyModifier[] },
}
