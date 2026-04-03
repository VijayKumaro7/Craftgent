/**
 * useTemplatesStore — manage prompt templates
 * Persists to localStorage for recovery across sessions
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AgentName } from '@/types'

export interface Template {
  id: string
  name: string
  prompt: string
  agent?: AgentName
  category: 'code' | 'research' | 'data' | 'general'
  createdAt: number
}

interface TemplatesState {
  templates: Template[]
  addTemplate: (template: Omit<Template, 'id' | 'createdAt'>) => void
  deleteTemplate: (id: string) => void
  getByCategory: (category: Template['category']) => Template[]
  getByAgent: (agent: AgentName) => Template[]
  searchTemplates: (query: string) => Template[]
}

const DEFAULT_TEMPLATES: Omit<Template, 'id' | 'createdAt'>[] = [
  {
    name: 'Write Unit Test',
    prompt: 'Write a comprehensive unit test for the following code. Include edge cases and error scenarios.',
    agent: 'ALEX',
    category: 'code',
  },
  {
    name: 'Code Review',
    prompt: 'Review the following code for readability, performance, security issues, and best practices. Provide specific suggestions.',
    agent: 'ALEX',
    category: 'code',
  },
  {
    name: 'Refactor Code',
    prompt: 'Refactor the following code to improve readability and maintainability while preserving functionality.',
    agent: 'ALEX',
    category: 'code',
  },
  {
    name: 'Explain Code',
    prompt: 'Explain what the following code does in simple terms. Break down the logic and explain any complex parts.',
    agent: 'ALEX',
    category: 'code',
  },
  {
    name: 'Analyze Dataset',
    prompt: 'Analyze the provided dataset and generate insights. Include summary statistics, trends, and interesting patterns.',
    agent: 'VORTEX',
    category: 'data',
  },
  {
    name: 'Data Visualization',
    prompt: 'Create code to visualize the following data in a meaningful way. Choose the most appropriate chart type.',
    agent: 'VORTEX',
    category: 'data',
  },
  {
    name: 'SQL Query',
    prompt: 'Write an optimized SQL query for the following requirement:',
    agent: 'VORTEX',
    category: 'data',
  },
  {
    name: 'Research Topic',
    prompt: 'Research and provide a comprehensive overview of the following topic. Include key concepts, recent developments, and relevant resources.',
    agent: 'NEXUS',
    category: 'research',
  },
  {
    name: 'Market Analysis',
    prompt: 'Analyze the current market trends for the following industry/product. Include competitive landscape and growth opportunities.',
    agent: 'NEXUS',
    category: 'research',
  },
  {
    name: 'Problem Solving',
    prompt: 'Help me solve this problem step-by-step. Provide multiple approaches and discuss the pros and cons of each.',
    agent: 'NEXUS',
    category: 'general',
  },
  {
    name: 'Brainstorming',
    prompt: 'Generate creative ideas and suggestions for the following:',
    agent: 'NEXUS',
    category: 'general',
  },
]

function generateId() {
  return Math.random().toString(36).slice(2, 11)
}

export const useTemplatesStore = create<TemplatesState>()(
  persist(
    (set, get) => ({
      templates: DEFAULT_TEMPLATES.map((t) => ({
        ...t,
        id: generateId(),
        createdAt: Date.now(),
      })),

      addTemplate: (template) =>
        set({
          templates: [
            ...get().templates,
            {
              ...template,
              id: generateId(),
              createdAt: Date.now(),
            },
          ],
        }),

      deleteTemplate: (id) =>
        set({
          templates: get().templates.filter((t) => t.id !== id),
        }),

      getByCategory: (category) =>
        get().templates.filter((t) => t.category === category),

      getByAgent: (agent) =>
        get().templates.filter((t) => t.agent === agent),

      searchTemplates: (query) => {
        const q = query.toLowerCase()
        return get().templates.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.prompt.toLowerCase().includes(q)
        )
      },
    }),
    {
      name: 'craftgent-templates',
    }
  )
)
