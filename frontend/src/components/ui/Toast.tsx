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

  const typeStyles: Record<string, string> = {
    success: 'border-success/30 text-success',
    error:   'border-error/30 text-error',
    warning: 'border-warning/30 text-warning',
    info:    'border-accent-primary/30 text-accent-hover',
  }

  const icons: Record<string, string> = {
    success: '✓',
    error:   '✕',
    warning: '⚠',
    info:    'i',
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] space-y-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`glass-strong rounded-xl px-4 py-3 border animate-slide-in-left ${typeStyles[toast.type]} pointer-events-auto shadow-card`}
        >
          <div className="flex items-start gap-3">
            <span className="text-sm font-bold flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full border border-current">
              {icons[toast.type]}
            </span>
            <p className="text-sm leading-snug flex-1 text-text-primary">{toast.message}</p>
            <button
              onClick={() => {
                activeToasts.delete(toast.id)
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }}
              className="text-text-muted hover:text-text-primary flex-shrink-0 text-xs"
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
