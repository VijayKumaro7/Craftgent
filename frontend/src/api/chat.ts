/**
 * Chat API — all calls to the backend go through here.
 *
 * streamChat() uses the native fetch API (not Axios) because Axios
 * doesn't support streaming responses. We parse the SSE stream manually.
 */
import { apiClient } from './client'
import type { AgentName, SSEChunk, HealthResponse } from '@/types'

// ── Health ────────────────────────────────────────────────────────────────

export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>('/api/health')
  return data
}

// ── Streaming chat ────────────────────────────────────────────────────────

export interface StreamChatOptions {
  message: string
  agent: AgentName
  sessionId?: string
  /** Called for every token received */
  onToken: (token: string) => void
  /** Called when the stream closes — receives the full assembled text */
  onDone: (fullText: string, sessionId: string) => void
  /** Called on error */
  onError: (error: string) => void
  /** AbortSignal to cancel the request */
  signal?: AbortSignal
}

/**
 * Opens an SSE stream to POST /api/chat and calls callbacks as data arrives.
 *
 * SSE format from the backend:
 *   data: {"session_id": "..."}        ← first chunk, always
 *   data: {"token": "..."}             ← one per token
 *   data: {"done": true, "full_text": "..."} ← final chunk
 *   data: {"error": "..."}             ← on failure
 */
export async function streamChat(options: StreamChatOptions): Promise<void> {
  const { message, agent, sessionId, onToken, onDone, onError, signal } = options

  const BASE_URL = import.meta.env.VITE_API_URL ?? ''
  const url = `${BASE_URL}/api/chat`

  let resolvedSessionId = sessionId ?? ''

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, agent, session_id: sessionId ?? null }),
      signal,
    })

    if (!response.ok) {
      const text = await response.text()
      onError(`HTTP ${response.status}: ${text}`)
      return
    }

    if (!response.body) {
      onError('No response body')
      return
    }

    // Read SSE stream line by line
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let fullText = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // SSE lines are separated by \n\n
      const lines = buffer.split('\n\n')
      // Last element may be incomplete — keep it in buffer
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        // Each SSE message starts with "data: "
        const dataLine = line.trim()
        if (!dataLine.startsWith('data: ')) continue

        const jsonStr = dataLine.slice(6)  // remove "data: " prefix
        try {
          const chunk = JSON.parse(jsonStr) as SSEChunk

          if ('session_id' in chunk) {
            resolvedSessionId = chunk.session_id
          } else if ('token' in chunk) {
            fullText += chunk.token
            onToken(chunk.token)
          } else if ('done' in chunk && chunk.done) {
            onDone(chunk.full_text, resolvedSessionId)
            return
          } else if ('error' in chunk) {
            onError(chunk.error)
            return
          }
        } catch {
          // Malformed JSON chunk — skip silently
          if (import.meta.env.DEV) {
            console.warn('[SSE] Failed to parse chunk:', jsonStr)
          }
        }
      }
    }

    // Stream ended without a done signal — treat as complete
    if (fullText) {
      onDone(fullText, resolvedSessionId)
    }

  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return  // user cancelled — not an error
    }
    onError(err instanceof Error ? err.message : 'Unknown error')
  }
}
