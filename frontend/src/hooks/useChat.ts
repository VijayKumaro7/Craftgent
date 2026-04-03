import { useState, useCallback } from 'react';
import { useChatStore } from '@store/chatStore';
import { chatAPI } from '@api/chat';
import { Message, AgentName } from '@types/chat';

export const useChat = () => {
  const {
    messages,
    currentSessionId,
    selectedAgent,
    streamingText,
    isStreaming,
    setMessages,
    addMessage,
    setStreamingText,
    setIsStreaming,
    setCurrentSessionId,
    setError,
  } = useChatStore();

  const sendMessage = useCallback(
    async (messageText: string, agent: AgentName = selectedAgent) => {
      if (!messageText.trim()) return;

      try {
        // Add user message immediately
        const userMessage: Message = {
          id: `user-${Date.now()}`,
          role: 'user',
          content: messageText,
          created_at: new Date().toISOString(),
        };

        addMessage(userMessage);
        setStreamingText('');
        setIsStreaming(true);

        let newSessionId = currentSessionId;
        let fullResponseText = '';

        // Stream response
        for await (const event of chatAPI.sendMessage(messageText, agent, currentSessionId)) {
          if (event.error) {
            setError(event.error);
            setIsStreaming(false);
            return;
          }

          if (event.token) {
            setStreamingText((prev) => prev + event.token);
            fullResponseText += event.token;
          }

          if (event.done && event.full_text) {
            fullResponseText = event.full_text;
            newSessionId = event.done ? currentSessionId : newSessionId;
          }
        }

        // Add assistant message
        if (fullResponseText) {
          const assistantMessage: Message = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: fullResponseText,
            agent: agent,
            created_at: new Date().toISOString(),
          };

          addMessage(assistantMessage);

          // If this was the first message in a new session, we might get a session_id back
          // This would be set in the response - you may need to handle this from backend
        }

        setStreamingText('');
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to send message');
      } finally {
        setIsStreaming(false);
      }
    },
    [currentSessionId, selectedAgent, addMessage, setStreamingText, setIsStreaming, setError]
  );

  const loadSession = useCallback(
    async (sessionId: string) => {
      try {
        const session = await chatAPI.getSession(sessionId);
        setCurrentSessionId(sessionId);
        setMessages(session.messages || []);
        setError(null);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load session');
      }
    },
    [setCurrentSessionId, setMessages, setError]
  );

  const createNewSession = useCallback(() => {
    setCurrentSessionId(null);
    setMessages([]);
    setStreamingText('');
    setError(null);
  }, [setCurrentSessionId, setMessages, setStreamingText, setError]);

  return {
    messages,
    currentSessionId,
    selectedAgent,
    streamingText,
    isStreaming,
    sendMessage,
    loadSession,
    createNewSession,
  };
};
