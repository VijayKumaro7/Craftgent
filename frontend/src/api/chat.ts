import { ChatRequest, ChatStreamEvent, Message, AgentName } from '@types/chat';
import { apiClient } from './client';

export const chatAPI = {
  /**
   * Send a message and stream the response via SSE
   * Returns an async generator that yields streaming tokens
   */
  sendMessage: async function* (
    message: string,
    agent: AgentName = 'NEXUS',
    sessionId?: string
  ): AsyncGenerator<ChatStreamEvent, void, unknown> {
    const request: ChatRequest = {
      message,
      agent,
      session_id: sessionId,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        yield {
          error: error.detail || 'Failed to send message',
        };
        return;
      }

      if (!response.body) {
        yield { error: 'No response body' };
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6)) as ChatStreamEvent;
              yield event;

              if (event.done) {
                return;
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } catch (error) {
      yield {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Get a specific chat session with all messages
   */
  getSession: async (sessionId: string): Promise<any> => {
    const response = await apiClient.get(`/api/sessions/${sessionId}`);
    return response.data;
  },

  /**
   * List all user sessions (paginated)
   */
  listSessions: async (page: number = 1, perPage: number = 20): Promise<any> => {
    const response = await apiClient.get('/api/sessions', {
      params: { page, per_page: perPage },
    });
    return response.data;
  },

  /**
   * Delete a session
   */
  deleteSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/api/sessions/${sessionId}`);
  },
};
