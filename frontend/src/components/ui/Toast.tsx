/**
 * Toast — Simple notification system for user feedback
 * Shows success, error, warning, info messages
 */
import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

// Global toast state
let toastId = 0
const listeners: Set<(toast: Toast) => void> = new Set()
const activeToasts: Map<string, Toast> = new Map()

/**
 * Show a toast notification
 */
export function showToast(message: string, type: ToastType = 'info', duration = 4000) {
  const id = `toast-${++toastId}`
  const toast: Toast = { id, message, type, duration }

  activeToasts.set(id, toast)
  listeners.forEach((listener) => listener(toast))

  if (duration > 0) {
    setTimeout(() => {
      activeToasts.delete(id)
      // Notify listeners of removal by sending a removal event
      listeners.forEach((listener) => listener({ id, message: '', type: 'info' }))
    }, duration)
  }

  return id
}

/**
 * Toast container component - place once at app level
 */
export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const handleToast = (toast: Toast) => {
      if (toast.message === '') {
        // Remove toast
        setToasts((prev) => prev.filter((t) => t.id !== toast.id))
      } else {
        // Add or update toast
        setToasts((prev) => {
          const existing = prev.find((t) => t.id === toast.id)
          if (existing) {
            return prev
          }
          return [...prev, toast]
        })
      }
    }

    listeners.add(handleToast)
    return () => {
      listeners.delete(handleToast)
    }
  }, [])

  const typeStyles = {
    success: 'bg-green-900/80 border-green-500/30 text-green-300',
    error: 'bg-red-900/80 border-red-500/30 text-red-300',
    warning: 'bg-yellow-900/80 border-yellow-500/30 text-yellow-300',
    info: 'bg-blue-900/80 border-blue-500/30 text-blue-300',
  }

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded border backdrop-blur-sm animate-[slideIn_0.3s_ease-out] ${typeStyles[toast.type]} pointer-events-auto`}
        >
          <div className="flex items-start gap-2">
            <span className="text-lg flex-shrink-0">{icons[toast.type]}</span>
            <p className="font-terminal text-[13px] leading-tight flex-1">{toast.message}</p>
            <button
              onClick={() => {
                activeToasts.delete(toast.id)
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }}
              className="text-white/50 hover:text-white/80 flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Hook to use toast notifications
 */
export function useToast() {
  return {
    success: (message: string) => showToast(message, 'success'),
    error: (message: string) => showToast(message, 'error'),
    warning: (message: string) => showToast(message, 'warning'),
    info: (message: string) => showToast(message, 'info'),
  }
}
