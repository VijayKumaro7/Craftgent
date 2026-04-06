import { useState } from 'react'
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

function StreamCursor() {
  return (
    <span className="inline-block w-[2px] h-[0.9em] bg-chat-agent ml-px align-middle animate-[blink_0.7s_steps(1)_infinite]" />
  )
}

type ChildrenElement = React.ReactNode | React.ReactNode[]

export function ChatMessage({ msg, isStreaming = false }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)

  const isSystem = msg.role === 'system'
  const isUser = msg.role === 'user'
  const senderColor = isSystem ? 'text-chat-sys' : isUser ? 'text-chat-user' : 'text-chat-agent'
  const sender = isSystem ? '[SERVER]' : isUser ? 'Operator:' : `${msg.agent ?? 'NEXUS'}:`

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(msg.content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const timestamp = msg.createdAt ? formatRelativeTime(msg.createdAt) : null

  return (
    <div className="group mb-3 animate-[fadeIn_0.1s_steps(2,end)]">
      {/* Header with sender + timestamp */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {!isSystem && !isUser && msg.agent && (
            <AgentAvatar agent={msg.agent as any} size={28} className="flex-shrink-0" />
          )}
          <div className="font-terminal text-[19px] leading-tight">
            <span className={`font-bold ${senderColor}`}>{sender}</span>
            {timestamp && <span className="text-white/50 text-[12px] ml-2">{timestamp}</span>}
          </div>
        </div>
        {/* Copy button - visible on mobile, hover on desktop */}
        <button
          onClick={handleCopyMessage}
          className="md:opacity-0 md:group-hover:opacity-100 font-pixel text-[7px] md:text-[8px] px-2 md:px-1.5 py-1.5 md:py-0.5 rounded bg-blue-900/50 hover:bg-blue-800/70 text-blue-300 transition min-h-[1.5rem] md:min-h-auto flex items-center justify-center"
          aria-label="Copy message"
        >
          {copied ? '✓' : 'COPY'}
        </button>
      </div>

      {/* Content with markdown rendering */}
      <div className="font-terminal text-[19px] leading-[1.8] drop-shadow-[1px_1px_0_#000] text-[#e8e8e8]">
        {isSystem ? (
          <span>
            {msg.content}
            {isStreaming && <StreamCursor />}
          </span>
        ) : (
          <>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: ({ inline, className, children }: { inline?: boolean; className?: string; children: ChildrenElement }) => {
                  const isCodeBlock = (className as string)?.startsWith('language-')
                  if (inline || !isCodeBlock) {
                    return (
                      <code className="bg-black/40 px-1.5 py-0.5 rounded text-yellow-300 font-terminal text-[17px]">
                        {children}
                      </code>
                    )
                  }
                  const language = (className as string).replace(/language-/, '') || 'plaintext'
                  return <CodeBlock language={language}>{String(children).replace(/\n$/, '')}</CodeBlock>
                },
                ul: ({ children }: { children: ChildrenElement }) => (
                  <ul className="list-disc list-inside my-2 ml-4">{children}</ul>
                ),
                ol: ({ children }: { children: ChildrenElement }) => (
                  <ol className="list-decimal list-inside my-2 ml-4">{children}</ol>
                ),
                table: ({ children }: { children: ChildrenElement }) => (
                  <table className="border-collapse border border-white/20 my-2 text-[17px]">
                    {children}
                  </table>
                ),
                th: ({ children }: { children: ChildrenElement }) => (
                  <th className="border border-white/20 px-2 py-1 bg-white/10 text-left">
                    {children}
                  </th>
                ),
                td: ({ children }: { children: ChildrenElement }) => (
                  <td className="border border-white/20 px-2 py-1">{children}</td>
                ),
                a: ({ href, children }: { href?: string; children: ChildrenElement }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-300 underline hover:opacity-80"
                  >
                    {children}
                  </a>
                ),
                strong: ({ children }: { children: ChildrenElement }) => (
                  <strong className="font-bold text-yellow-100">{children}</strong>
                ),
                em: ({ children }: { children: ChildrenElement }) => (
                  <em className="italic text-white/80">{children}</em>
                ),
                blockquote: ({ children }: { children: ChildrenElement }) => (
                  <blockquote className="border-l-4 border-white/30 pl-3 my-2 text-white/70 italic">
                    {children}
                  </blockquote>
                ),
                p: ({ children }: { children: ChildrenElement }) => <p className="my-1">{children}</p>,
                h1: ({ children }: { children: ChildrenElement }) => (
                  <h1 className="text-xl font-bold my-2 text-yellow-100">{children}</h1>
                ),
                h2: ({ children }: { children: ChildrenElement }) => (
                  <h2 className="text-lg font-bold my-1.5 text-yellow-100">{children}</h2>
                ),
                h3: ({ children }: { children: ChildrenElement }) => (
                  <h3 className="text-base font-bold my-1 text-yellow-100">{children}</h3>
                ),
              } as any}
            >
              {msg.content}
            </ReactMarkdown>
            {isStreaming && <StreamCursor />}
          </>
        )}
      </div>
    </div>
  )
}
