import { create } from 'zustand';
import { Message, ChatSession, AgentName, SessionSummary } from '@types/chat';

interface ChatStore {
  // State
  sessions: SessionSummary[];
  currentSessionId: string | null;
  messages: Message[];
  selectedAgent: AgentName;
  isLoading: boolean;
  isStreaming: boolean;
  streamingText: string;
  error: string | null;

  // Actions
  setSessions: (sessions: SessionSummary[]) => void;
  setCurrentSessionId: (sessionId: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setSelectedAgent: (agent: AgentName) => void;
  setIsLoading: (loading: boolean) => void;
  setIsStreaming: (streaming: boolean) => void;
  setStreamingText: (text: string) => void;
  appendStreamingText: (text: string) => void;
  setError: (error: string | null) => void;
  clearCurrentSession: () => void;
  createNewSession: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  // Initial state
  sessions: [],
  currentSessionId: null,
  messages: [],
  selectedAgent: 'NEXUS',
  isLoading: false,
  isStreaming: false,
  streamingText: '',
  error: null,

  // Actions
  setSessions: (sessions) => set({ sessions }),
  setCurrentSessionId: (sessionId) => set({ currentSessionId: sessionId }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  setStreamingText: (text) => set({ streamingText: text }),
  appendStreamingText: (text) =>
    set((state) => ({
      streamingText: state.streamingText + text,
    })),
  setError: (error) => set({ error }),
  clearCurrentSession: () =>
    set({
      currentSessionId: null,
      messages: [],
      streamingText: '',
      error: null,
    }),
  createNewSession: () =>
    set({
      currentSessionId: null,
      messages: [],
      streamingText: '',
    }),
}));
