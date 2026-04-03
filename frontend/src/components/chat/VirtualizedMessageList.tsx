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
    estimateSize: () => 80,
    overscan: 10,
    measureElement: (element) => {
      return element?.getBoundingClientRect().height ?? 80
    },
  })

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (parentRef.current && virtualItems.length > 0) {
      virtualizer.scrollToIndex(messages.length - 1, { align: 'end' })
    }
  }, [messages.length, isStreaming, virtualizer, virtualItems])

  return (
    <div
      ref={parentRef}
      style={{
        height: '100%',
        overflow: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: '#1e1e3a transparent',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: `${totalSize}px`,
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
                right: 0,
                transform: `translateY(${virtualItem.start}px)`,
                width: '100%',
                padding: '0 0.75rem',
                boxSizing: 'border-box',
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
