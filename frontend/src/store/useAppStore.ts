/**
 * Zustand global store.
 *
 * Holds:
 * - active agent selection
 * - chat session + messages
 * - task queue state
 * - hotbar selection
 *
 * Kept flat and simple for Phase 1.
 * Phase 2 will split into slices as complexity grows.
 */
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { AgentName, ChatMessage, Task, InventorySlot } from '@/types'

// Simple nanoid-like fallback without the package
function uid(): string {
  return Math.random().toString(36).slice(2, 11)
}

// ── State shape ───────────────────────────────────────────────────────────

interface SessionTab {
  id: string
  agent: AgentName
  messages: ChatMessage[]
}

interface AppState {
  // Agent
  activeAgent: AgentName
  setActiveAgent: (agent: AgentName) => void

  // Session
  sessionId: string | null
  setSessionId: (id: string) => void

  // Session tabs (multi-tab support)
  openSessions: SessionTab[]
  addSession: (sessionId: string, agent: AgentName, messages: ChatMessage[]) => void
  switchSession: (sessionId: string) => void
  closeSession: (sessionId: string) => void

  // Messages
  messages: ChatMessage[]
  addSystemMessage: (content: string) => void
  addUserMessage: (content: string) => ChatMessage
  addStreamingMessage: (agent: AgentName) => string  // returns msg id
  appendToken: (id: string, token: string) => void
  finaliseMessage: (id: string, fullText: string) => void
  clearMessages: () => void

  // Streaming state
  isStreaming: boolean
  setIsStreaming: (v: boolean) => void

  // Tasks / quests
  tasks: Task[]
  updateTaskProgress: (id: string, progress: number) => void

  // Hotbar
  selectedSlot: number
  setSelectedSlot: (slot: number) => void

  // Inventory
  inventory: InventorySlot[]

  // Input
  inputValue: string
  setInputValue: (value: string) => void
  insertIntoInput: (text: string) => void
}

// ── Initial data ──────────────────────────────────────────────────────────

const INITIAL_TASKS: Task[] = [
  { id: 'task-1', name: 'Boot system',    icon: '⚡', status: 'done',    progress: 100 },
  { id: 'task-2', name: 'Load agents',    icon: '🤖', status: 'done',    progress: 100 },
  { id: 'task-3', name: 'Connect API',    icon: '📡', status: 'running', progress: 0   },
  { id: 'task-4', name: 'Index memory',   icon: '🧠', status: 'queued',  progress: 0   },
]

const INITIAL_INVENTORY: InventorySlot[] = [
  { id: 'inv-1', emoji: '🔍', label: 'Web Search',   count: 12 },
  { id: 'inv-2', emoji: '⚡', label: 'Code Exec',    count: 7  },
  { id: 'inv-3', emoji: '🗄️', label: 'Database',    count: 3  },
  { id: 'inv-4', emoji: '📡', label: 'API Compass',  count: 1  },
  { id: 'inv-5', emoji: '🔧', label: 'Debug Sword',  count: 5  },
  { id: 'inv-6', emoji: '🧬', label: 'DNA Potion',   count: 2  },
  { id: 'inv-7', emoji: '🏹', label: 'Arrows',       count: 64 },
  { id: 'inv-8', emoji: '📜', label: 'Report',       count: 1  },
  { id: 'inv-9', emoji: '🤖', label: 'Agent Core',   count: 1  },
]

// ── Store ─────────────────────────────────────────────────────────────────

const withDevtools = import.meta.env.DEV ? devtools : <T>(fn: T) => fn

export const useAppStore = create<AppState>()(
  withDevtools(
    (set) => ({
      // Agent
      activeAgent: 'NEXUS',
      setActiveAgent: (agent) => set({ activeAgent: agent }, false, 'setActiveAgent'),

      // Session
      sessionId: null,
      setSessionId: (id) => set({ sessionId: id }, false, 'setSessionId'),

      // Session tabs
      openSessions: [],

      addSession: (sessionId, agent, messages) =>
        set(
          (s) => {
            const existing = s.openSessions.find(tab => tab.id === sessionId)
            if (existing) return s // don't add duplicate
            return {
              openSessions: [...s.openSessions, { id: sessionId, agent, messages }],
              sessionId,
              messages,
              activeAgent: agent,
            }
          },
          false,
          'addSession'
        ),

      switchSession: (sessionId) =>
        set(
          (s) => {
            const tab = s.openSessions.find(t => t.id === sessionId)
            if (!tab) return s
            return {
              sessionId,
              messages: tab.messages,
              activeAgent: tab.agent,
            }
          },
          false,
          'switchSession'
        ),

      closeSession: (sessionId) =>
        set(
          (s) => {
            const remaining = s.openSessions.filter(t => t.id !== sessionId)
            const wasActive = s.sessionId === sessionId
            if (!wasActive) return { openSessions: remaining }
            // If closing active session, switch to the last open one
            if (remaining.length > 0) {
              const next = remaining[remaining.length - 1]
              return {
                openSessions: remaining,
                sessionId: next.id,
                messages: next.messages,
                activeAgent: next.agent,
              }
            }
            // If no sessions left, reset
            return {
              openSessions: remaining,
              sessionId: null,
              messages: [
                {
                  id: uid(),
                  role: 'system',
                  content: 'CraftAgent v0.1.0 initialized. All agents online. Type a message to begin.',
                  createdAt: new Date(),
                },
              ],
            }
          },
          false,
          'closeSession'
        ),

      // Messages — start with a boot message
      messages: [
        {
          id: uid(),
          role: 'system',
          content: 'CraftAgent v0.1.0 initialized. All agents online. Type a message to begin.',
          createdAt: new Date(),
        },
      ],

      addSystemMessage: (content) =>
        set(
          (s) => ({
            messages: [
              ...s.messages,
              { id: uid(), role: 'system', content, createdAt: new Date() } satisfies ChatMessage,
            ],
          }),
          false,
          'addSystemMessage'
        ),

      addUserMessage: (content) => {
        const msg: ChatMessage = {
          id: uid(),
          role: 'user',
          content,
          createdAt: new Date(),
        }
        set((s) => ({ messages: [...s.messages, msg] }), false, 'addUserMessage')
        return msg
      },

      addStreamingMessage: (agent) => {
        const id = uid()
        const msg: ChatMessage = {
          id,
          role: 'assistant',
          content: '',
          agent,
          createdAt: new Date(),
          streaming: true,
        }
        set((s) => ({ messages: [...s.messages, msg] }), false, 'addStreamingMessage')
        return id
      },

      appendToken: (id, token) =>
        set(
          (s) => ({
            messages: s.messages.map((m) =>
              m.id === id ? { ...m, content: m.content + token } : m
            ),
          }),
          false,
          'appendToken'
        ),

      finaliseMessage: (id, fullText) =>
        set(
          (s) => ({
            messages: s.messages.map((m) =>
              m.id === id ? { ...m, content: fullText, streaming: false } : m
            ),
          }),
          false,
          'finaliseMessage'
        ),

      clearMessages: () =>
        set(
          {
            messages: [
              {
                id: uid(),
                role: 'system',
                content: 'Chat cleared.',
                createdAt: new Date(),
              },
            ],
          },
          false,
          'clearMessages'
        ),

      // Streaming
      isStreaming: false,
      setIsStreaming: (v) => set({ isStreaming: v }, false, 'setIsStreaming'),

      // Tasks
      tasks: INITIAL_TASKS,
      updateTaskProgress: (id, progress) =>
        set(
          (s) => ({
            tasks: s.tasks.map((t) =>
              t.id === id
                ? { ...t, progress, status: progress >= 100 ? 'done' : progress > 0 ? 'running' : 'queued' }
                : t
            ),
          }),
          false,
          'updateTaskProgress'
        ),

      // Hotbar
      selectedSlot: 0,
      setSelectedSlot: (slot) => set({ selectedSlot: slot }, false, 'setSelectedSlot'),

      // Inventory
      inventory: INITIAL_INVENTORY,

      // Input
      inputValue: '',
      setInputValue: (value) => set({ inputValue: value }, false, 'setInputValue'),
      insertIntoInput: (text) =>
        set(
          (s) => ({
            inputValue: s.inputValue + (s.inputValue && !s.inputValue.endsWith(' ') ? ' ' : '') + text,
          }),
          false,
          'insertIntoInput'
        ),
    }),
    { name: 'CraftAgent' }
  )
)
