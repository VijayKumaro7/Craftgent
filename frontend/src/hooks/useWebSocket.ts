/**
 * useWebSocket — manages the WebSocket connection to the backend.
 *
 * Features:
 * - Auto-reconnect with exponential backoff
 * - Typed event protocol (token / done / handoff / system / error)
 * - Connection status exposed to UI
 * - Cleans up on unmount
 */
import { useEffect, useRef, useCallback, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useAuthStore } from '@/store/useAuthStore'

export type WsStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

const WS_BASE = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8000'
const MAX_RETRIES = 5

interface UseWebSocketReturn {
  status: WsStatus
  send: (message: string) => void
  sessionId: string | null
}

export function useWebSocket(): UseWebSocketReturn {
  const [status, setStatus]   = useState<WsStatus>('disconnected')
  const wsRef                 = useRef<WebSocket | null>(null)
  const retriesRef            = useRef(0)
  const sessionIdRef          = useRef<string | null>(null)
  const pendingMsgIdRef       = useRef<string | null>(null)

  const {
    addStreamingMessage, appendToken, finaliseMessage,
    addSystemMessage, setIsStreaming, setSessionId,
    activeAgent, setActiveAgent, sessionId,
  } = useAppStore()

  const { accessToken } = useAuthStore()

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const sid = sessionIdRef.current ?? 'new'
    const url = `${WS_BASE}/api/ws/${sid}`

    setStatus('connecting')
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      setStatus('connected')
      retriesRef.current = 0
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string)
        handleEvent(msg)
      } catch {
        console.warn('[WS] Failed to parse message', event.data)
      }
    }

    ws.onerror = () => {
      setStatus('error')
    }

    ws.onclose = () => {
      setStatus('disconnected')
      wsRef.current = null

      // Auto-reconnect with backoff
      if (retriesRef.current < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** retriesRef.current, 15000)
        retriesRef.current++
        setTimeout(connect, delay)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleEvent = useCallback((msg: Record<string, unknown>) => {
    const type = msg.type as string

    switch (type) {
      case 'connected': {
        const sid = msg.session_id as string
        sessionIdRef.current = sid
        setSessionId(sid)
        addSystemMessage(`[SERVER] Session established. Ready.`)
        break
      }

      case 'token': {
        const token = msg.data as string
        if (pendingMsgIdRef.current) {
          appendToken(pendingMsgIdRef.current, token)
        }
        break
      }

      case 'done': {
        const fullText  = msg.data as string
        if (pendingMsgIdRef.current) {
          finaliseMessage(pendingMsgIdRef.current, fullText)
          pendingMsgIdRef.current = null
        }
        setIsStreaming(false)
        addSystemMessage(`[LOOT] +${20 + Math.floor(Math.random() * 80)} XP earned!`)
        break
      }

      case 'handoff': {
        const from = msg.from_agent as string
        const to   = msg.to_agent as string
        setActiveAgent(to as ReturnType<typeof useAppStore.getState>['activeAgent'])
        addSystemMessage(`[TASK] ${from} delegating to ${to}...`)
        // Start a new streaming bubble for the new agent
        if (pendingMsgIdRef.current) {
          finaliseMessage(pendingMsgIdRef.current, '...')
        }
        pendingMsgIdRef.current = addStreamingMessage(
          to as ReturnType<typeof useAppStore.getState>['activeAgent']
        )
        break
      }

      case 'system':
        addSystemMessage(msg.data as string)
        break

      case 'error':
        if (pendingMsgIdRef.current) {
          finaliseMessage(pendingMsgIdRef.current, `[ERROR] ${msg.data}`)
          pendingMsgIdRef.current = null
        }
        setIsStreaming(false)
        addSystemMessage(`[ERROR] ${msg.data}`)
        break

      case 'pong':
        break

      default:
        break
    }
  }, [activeAgent, addStreamingMessage, appendToken, finaliseMessage,
      addSystemMessage, setIsStreaming, setSessionId, setActiveAgent])

  const send = useCallback((message: string) => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      addSystemMessage('[ERROR] Not connected. Reconnecting...')
      connect()
      return
    }

    if (!accessToken) {
      addSystemMessage('[ERROR] Not authenticated. Please log in.')
      return
    }

    setIsStreaming(true)
    const msgId = addStreamingMessage(activeAgent)
    pendingMsgIdRef.current = msgId

    ws.send(JSON.stringify({
      type: 'chat',
      message,
      agent: activeAgent,
      token: accessToken,
    }))
  }, [activeAgent, accessToken, addStreamingMessage, setIsStreaming, addSystemMessage, connect])

  useEffect(() => {
    connect()
    return () => {
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [connect])

  return { status, send, sessionId }
}
