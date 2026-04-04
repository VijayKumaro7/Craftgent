/**
 * TemplatesPanel — collapsible panel showing saved prompt templates
 * Click a template to insert it into the chat input
 */
import { useState } from 'react'
import { useTemplatesStore, type Template } from '@/store/useTemplatesStore'

const CATEGORIES = ['general', 'code', 'data', 'research'] as const
const AGENT_COLORS: Record<string, string> = {
  NEXUS:  '#55ffff',
  ALEX:   '#aaffaa',
  VORTEX: '#cc88ff',
}

interface TemplatesPanelProps {
  onSelectTemplate?: (prompt: string) => void
}

export function TemplatesPanel({ onSelectTemplate }: TemplatesPanelProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number] | 'all'>('all')
  const { templates } = useTemplatesStore()

  // Filter templates
  const filtered = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.prompt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSelectTemplate = (template: Template) => {
    onSelectTemplate?.(template.prompt)
    setOpen(false)
  }

  return (
    <div className="border-t border-white/10">
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-2 py-1.5 font-pixel text-[6px] text-chat-sys hover:bg-white/5 focus:outline-none"
      >
        <span>▶ TEMPLATES</span>
        <span className="text-white/40">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="flex flex-col max-h-[280px]" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e1e3a transparent' }}>
          {/* Search input */}
          <div className="px-2 py-1.5 border-b border-white/10">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full bg-black/40 border border-white/20 rounded px-1.5 py-0.5 font-terminal text-[12px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/40"
              aria-label="Search templates"
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1 px-2 py-1 border-b border-white/10 overflow-x-auto scrollbar-hide text-[5px]">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-white/20 text-white font-pixel'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              ALL
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors capitalize ${
                  selectedCategory === cat
                    ? 'bg-white/20 text-white font-pixel'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Templates list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="px-2 py-3 font-pixel text-[5px] text-white/30 text-center">
                NO TEMPLATES
              </div>
            )}

            {filtered.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className="w-full text-left px-2 py-2 border-b border-white/5 hover:bg-white/8 focus:outline-none group transition-colors"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span
                    className="font-pixel text-[5px]"
                    style={{ color: template.agent ? AGENT_COLORS[template.agent] ?? '#fff' : '#fff' }}
                  >
                    {template.agent ?? 'GENERAL'}
                  </span>
                  <span className="font-pixel text-[4px] text-white/30 capitalize">
                    {template.category}
                  </span>
                </div>

                <div className="font-terminal text-[13px] text-white/70 leading-tight group-hover:text-white/90 line-clamp-1 mb-0.5">
                  {template.name}
                </div>

                <div className="font-terminal text-[11px] text-white/40 leading-tight line-clamp-2">
                  {template.prompt}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
