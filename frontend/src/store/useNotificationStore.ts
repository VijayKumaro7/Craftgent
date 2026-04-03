/**
 * Notification store for toast messages.
 */
import { create } from 'zustand'

export type NotificationType = 'error' | 'success' | 'info' | 'warning'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  timestamp: number
  duration?: number
}

interface NotificationState {
  notifications: Notification[]
  addNotification: (type: NotificationType, message: string, duration?: number) => void
  removeNotification: (id: string) => void
}

function generateId() {
  return Math.random().toString(36).slice(2, 11)
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (type, message, duration = 5000) => {
    const id = generateId()
    set((state) => ({
      notifications: [...state.notifications, { id, type, message, timestamp: Date.now(), duration }],
    }))
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      }, duration)
    }
  },
  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },
}))
