import { useState, memo, ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ChatMessage as ChatMessageType } from '@/types'
import { CodeBlock } from './CodeBlock'
import { AgentAvatar } from '@/components/ui/AgentAvatar'
import { formatRelativeTime } from '@/utils/dateFormat'

interface ChatMessageProps {
  msg: ChatMessageType
  isStreaming?: boolean
}

const AGENT_COLORS: Record<string, string> = {
  NEXUS:      '#7c3aed',
  ALEX:       '#059669',
  VORTEX:     '#a78bfa',
  RESEARCHER: '#f97316',
}

function StreamCursor() {
  return <span className="stream-cursor" />
}

type ChildrenElement = ReactNode | ReactNode[]

function ChatMessageComponent({ msg, isStreaming = false }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)

  const isSystem = msg.role === 'system'
  const isUser   = msg.role === 'user'
  const agentColor = msg.agent ? (AGENT_COLORS[msg.agent] ?? '#7c3aed') : '#7c3aed'
  const sender = isSystem ? 'System' : isUser ? 'You' : (msg.agent ?? 'NEXUS')
  const timestamp = msg.createdAt ? formatRelativeTime(msg.createdAt) : null

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (isSystem) {
    return (
      <div className="px-4 py-1.5 chat-enter">
        <p className="text-xs text-text-muted italic">
          {msg.content}
          {isStreaming && <StreamCursor />}
        </p>
      </div>
    )
  }

  return (
    <div
      className={`group px-4 py-3 chat-enter transition-colors duration-150 hover:bg-white/[0.02] ${
        isUser ? 'border-l-2 border-accent-primary/30' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {!isUser && msg.agent && (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <AgentAvatar agent={msg.agent as any} size="md" className="flex-shrink-0" />
          )}
          {isUser && (
            <div className="w-6 h-6 rounded-full bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center text-xs font-semibold text-accent-primary flex-shrink-0">
              You
            </div>
          )}
          <span
            className="text-sm font-semibold"
            style={{ color: isUser ? '#818cf8' : agentColor }}
          >
            {sender}
          </span>
          {timestamp && (
            <span className="text-text-muted text-xs">{timestamp}</span>
          )}
        </div>

        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-text-primary text-xs px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 transition-all duration-150"
          aria-label="Copy message"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      {/* Content */}
      <div className="chat-prose text-text-primary text-sm leading-relaxed ml-8">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code: ({ inline, className, children }: { inline?: boolean; className?: string; children: ChildrenElement }) => {
              const isBlock = (className as string)?.startsWith('language-')
              if (inline || !isBlock) {
                return (
                  <code className="bg-accent-primary/10 px-1.5 py-0.5 rounded text-sm font-mono text-accent-hover">
                    {children}
                  </code>
                )
              }
              const lang = (className as string).replace(/language-/, '') || 'plaintext'
              return <CodeBlock language={lang}>{String(children).replace(/\n$/, '')}</CodeBlock>
            },
            ul: ({ children }: { children: ChildrenElement }) => (
              <ul className="list-disc list-inside my-2 ml-4 space-y-0.5">{children}</ul>
            ),
            ol: ({ children }: { children: ChildrenElement }) => (
              <ol className="list-decimal list-inside my-2 ml-4 space-y-0.5">{children}</ol>
            ),
            table: ({ children }: { children: ChildrenElement }) => (
              <div className="overflow-x-auto my-3">
                <table className="border-collapse border border-border-subtle w-full text-sm">{children}</table>
              </div>
            ),
            th: ({ children }: { children: ChildrenElement }) => (
              <th className="border border-border-subtle px-3 py-1.5 bg-accent-primary/10 text-left font-medium text-text-primary">{children}</th>
            ),
            td: ({ children }: { children: ChildrenElement }) => (
              <td className="border border-border-subtle px-3 py-1.5 text-text-secondary">{children}</td>
            ),
            a: ({ href, children }: { href?: string; children: ChildrenElement }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent-hover underline hover:text-accent-cyan transition-colors">
                {children}
              </a>
            ),
            strong: ({ children }: { children: ChildrenElement }) => (
              <strong className="font-semibold text-text-primary">{children}</strong>
            ),
            em: ({ children }: { children: ChildrenElement }) => (
              <em className="italic text-text-secondary">{children}</em>
            ),
            blockquote: ({ children }: { children: ChildrenElement }) => (
              <blockquote className="border-l-4 border-accent-primary/40 pl-4 my-2 text-text-secondary italic">{children}</blockquote>
            ),
            p: ({ children }: { children: ChildrenElement }) => <p className="my-1">{children}</p>,
            h1: ({ children }: { children: ChildrenElement }) => (
              <h1 className="text-xl font-bold my-3 text-text-primary">{children}</h1>
            ),
            h2: ({ children }: { children: ChildrenElement }) => (
              <h2 className="text-lg font-semibold my-2 text-text-primary">{children}</h2>
            ),
            h3: ({ children }: { children: ChildrenElement }) => (
              <h3 className="text-base font-semibold my-2 text-text-primary">{children}</h3>
            ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any}
        >
          {msg.content}
        </ReactMarkdown>
        {isStreaming && <StreamCursor />}
      </div>
    </div>
  )
}

export const ChatMessage = memo(ChatMessageComponent, (prev, next) =>
  prev.msg.id === next.msg.id &&
  prev.msg.content === next.msg.content &&
  prev.isStreaming === next.isStreaming
)
