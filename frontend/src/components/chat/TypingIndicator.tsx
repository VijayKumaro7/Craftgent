import { useEffect, useState } from 'react'

interface TypingIndicatorProps {
  agentName?: string
}

export function TypingIndicator({ agentName = 'NEXUS' }: TypingIndicatorProps) {
  const [dots, setDots] = useState('.')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '.') return '..'
        if (prev === '..') return '...'
        return '.'
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mb-3 animate-[fadeIn_0.1s_steps(2,end)]">
      <div className="font-terminal text-[19px] leading-tight">
        <span className="font-bold text-chat-agent">{agentName}:</span>
      </div>
      <div className="font-terminal text-[19px] leading-[1.8] drop-shadow-[1px_1px_0_#000] text-[#e8e8e8]">
        <span className="inline-block">thinking{dots}</span>
      </div>
    </div>
  )
}
