import { useRef, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { ChatMessage } from '@/types'
import { ChatMessage as ChatMessageComponent } from './ChatMessage'

interface VirtualizedMessageListProps {
  messages: ChatMessage[]
  isStreaming?: boolean
}

export function VirtualizedMessageList({ messages, isStreaming = false }: VirtualizedMessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Average message height in pixels
    overscan: 10, // Render 10 items outside viewport for smooth scrolling
    measureElement: (element) => {
      return element?.getBoundingClientRect().height ?? 80
    },
  })

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (parentRef.current) {
      parentRef.current.scrollTop = parentRef.current.scrollHeight
    }
  }, [messages.length, isStreaming])

  return (
    <div
      ref={parentRef}
      style={{
        height: '100%',
        overflow: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: '#1e1e3a transparent',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          padding: '0.75rem',
          height: `${totalSize}px`,
          width: '100%',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const msg = messages[virtualItem.index]
          if (!msg) return null
          return (
            <div
              key={msg.id}
              data-index={virtualItem.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <ChatMessageComponent
                msg={msg}
                isStreaming={msg.streaming}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
