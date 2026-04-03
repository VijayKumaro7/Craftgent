import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@store/chatStore';
import { AgentName } from '@types/chat';

interface InputBoxProps {
  onSendMessage: (message: string, agent?: AgentName) => Promise<void>;
  isLoading?: boolean;
}

export const InputBox: React.FC<InputBoxProps> = ({ onSendMessage, isLoading = false }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { selectedAgent, setSelectedAgent } = useChatStore();

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const msg = message.trim();
    setMessage('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await onSendMessage(msg, selectedAgent);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className="space-y-3">
      {/* Agent Selector */}
      <div className="flex gap-2">
        <label className="text-xs font-medium text-[#a0a0a0] flex items-center">Agent:</label>
        <div className="flex gap-2">
          {(['NEXUS', 'ALEX', 'VORTEX'] as AgentName[]).map((agent) => (
            <button
              key={agent}
              onClick={() => setSelectedAgent(agent)}
              disabled={isLoading}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors disabled:opacity-50 ${
                selectedAgent === agent
                  ? 'bg-[#3b82f6] text-white'
                  : 'bg-[#2a2a2a] text-[#a0a0a0] hover:bg-[#3a3a3a]'
              }`}
            >
              {agent}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex gap-3">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Type your message... (Shift+Enter for new line)"
          className="flex-1 px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-[#e0e0e0] resize-none disabled:opacity-50 max-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          className="px-6 py-3 bg-[#3b82f6] text-white rounded font-medium hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
};
