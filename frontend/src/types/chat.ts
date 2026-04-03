export type AgentName = 'NEXUS' | 'ALEX' | 'VORTEX';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  agent?: AgentName;
  created_at: string;
}

export interface ChatSession {
  id: string;
  active_agent: AgentName;
  created_at: string;
  messages: Message[];
}

export interface ChatRequest {
  message: string;
  session_id?: string;
  agent: AgentName;
}

export interface ChatStreamEvent {
  token?: string;
  done?: boolean;
  full_text?: string;
  agent?: AgentName;
  error?: string;
}

export interface SessionSummary {
  id: string;
  created_at: string;
  message_count: number;
  last_message?: string;
}
