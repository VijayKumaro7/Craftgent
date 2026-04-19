// ── Agent types ──────────────────────────────────────────────────────────

export type AgentName = 'NEXUS' | 'ALEX' | 'VORTEX' | 'RESEARCHER'

export interface AgentProfile {
  name: AgentName
  role: string
  class: string
  hp: number       // 0–100
  mp: number       // 0–100
  level: number
  xp: number       // 0–100 (percent to next level)
  palette: [string, string, string]  // [skin, hair, eye] for pixel head
}

export const AGENTS: Record<AgentName, AgentProfile> = {
  NEXUS: {
    name: 'NEXUS',
    role: 'Research Mage',
    class: '§ Research Mage',
    hp: 90, mp: 74, level: 12, xp: 67,
    palette: ['#c07850', '#3a2010', '#44aaff'],
  },
  ALEX: {
    name: 'ALEX',
    role: 'Code Warrior',
    class: '§ Code Warrior',
    hp: 55, mp: 99, level: 8, xp: 42,
    palette: ['#d0a070', '#2a5a2a', '#44ee44'],
  },
  VORTEX: {
    name: 'VORTEX',
    role: 'Data Creeper',
    class: '§ Data Creeper',
    hp: 72, mp: 88, level: 15, xp: 81,
    palette: ['#3a3a3a', '#1a1a1a', '#ff3333'],
  },
  RESEARCHER: {
    name: 'RESEARCHER',
    role: 'Chief Investigator',
    class: '§ Archaeologist',
    hp: 85, mp: 95, level: 18, xp: 33,
    palette: ['#4a3728', '#8b6914', '#d4a574'],
  },
}

// ── Message types ─────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  agent?: AgentName
  createdAt: Date
  /** True while the assistant is still streaming tokens */
  streaming?: boolean
}

// ── Session ───────────────────────────────────────────────────────────────

export interface ChatSession {
  id: string
  activeAgent: AgentName
  messages: ChatMessage[]
}

// ── Task (Quest) ──────────────────────────────────────────────────────────

export type TaskStatus = 'done' | 'running' | 'queued'

export interface Task {
  id: string
  name: string
  icon: string
  status: TaskStatus
  progress: number   // 0–100
}

// ── Inventory ─────────────────────────────────────────────────────────────

export interface InventorySlot {
  id: string
  emoji: string
  label: string
  count: number
  selected?: boolean
}

// ── API response types ────────────────────────────────────────────────────

/** Parsed from SSE stream chunks */
export type SSEChunk =
  | { session_id: string }
  | { token: string }
  | { done: true; full_text: string }
  | { error: string; detail?: string }

export interface HealthResponse {
  status: string
  version: string
  environment: string
  db: string
}

// ── Agent history ─────────────────────────────────────────────────────────

export interface AgentOutput {
  id: string
  content: string
  session_id: string
  token_count: number
  created_at: string
}

export interface AgentHistoryResponse {
  agent: AgentName
  outputs: AgentOutput[]
  total: number
  page: number
  per_page: number
}
