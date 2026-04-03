import { useNotificationStore, type NotificationType } from '@/store/useNotificationStore'

function NotificationIcon({ type }: { type: NotificationType }) {
  const icons: Record<NotificationType, string> = {
    error: '❌',
    success: '✅',
    warning: '⚠️',
    info: 'ℹ️',
  }
  return icons[type]
}

function getColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    error: '#e02020',
    success: '#5aff5a',
    warning: '#f5c842',
    info: '#55ffff',
  }
  return colors[type]
}

export function NotificationStack() {
  const { notifications, removeNotification } = useNotificationStore()

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 100,
        left: 20,
        right: 20,
        maxWidth: 400,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      {notifications.map((notif) => (
        <div
          key={notif.id}
          onClick={() => removeNotification(notif.id)}
          style={{
            background: 'rgba(0,0,0,0.9)',
            border: `2px solid ${getColor(notif.type)}`,
            padding: '12px 16px',
            borderRadius: 4,
            fontFamily: '"VT323", monospace',
            fontSize: 12,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            pointerEvents: 'auto',
            cursor: 'pointer',
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <span style={{ fontSize: 16 }}>{NotificationIcon({ type: notif.type })}</span>
          <span style={{ flex: 1 }}>{notif.message}</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              removeNotification(notif.id)
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#aaa',
              cursor: 'pointer',
              fontSize: 16,
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(-400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
