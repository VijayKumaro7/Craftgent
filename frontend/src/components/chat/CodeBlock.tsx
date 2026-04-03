import { Highlight, themes } from 'prism-react-renderer'
import { useState } from 'react'

interface CodeBlockProps {
  children: string
  className?: string
  language?: string
}

export function CodeBlock({ children, className = '', language = 'plaintext' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  // Extract language from className if provided
  const lang = className?.replace(/language-/, '') || language

  const handleCopy = () => {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="relative my-2 rounded border border-white/20 bg-black/40 overflow-hidden group">
      {/* Language label + copy button */}
      <div className="flex items-center justify-between px-3 py-1 bg-black/60 border-b border-white/10">
        <span className="font-terminal text-[11px] text-white/60">{lang}</span>
        <button
          onClick={handleCopy}
          className="font-pixel text-[7px] md:text-[8px] px-2 md:px-2 py-1.5 md:py-1 rounded bg-green-900/50 hover:bg-green-800/70 text-green-300 transition min-h-[1.5rem] md:min-h-auto active:scale-95"
          aria-label="Copy code"
        >
          {copied ? '✓' : 'COPY'}
        </button>
      </div>

      {/* Code content */}
      <Highlight theme={themes.nightOwl} code={children.trim()} language={lang as 'javascript'}>
        {({ className: highlightClass, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${highlightClass} font-terminal text-[14px] p-3 overflow-x-auto`}
            style={{ ...style, backgroundColor: 'transparent' }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })}>
                <span className="inline-block w-8 text-right text-white/30 select-none mr-2">
                  {i + 1}
                </span>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  )
}
