import React from 'react';
import { Message } from '@types/chat';
import { AGENTS } from '@types/agent';

interface ChatBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isStreaming = false }) => {
  const isUser = message.role === 'user';
  const agentInfo = message.agent ? AGENTS[message.agent] : null;

  const bubbleClass = isUser
    ? 'message-user bg-[#3b82f6]'
    : 'message-assistant bg-[#1a1a1a] border border-[#2a2a2a]';

  const containerClass = isUser ? 'justify-end' : 'justify-start';

  return (
    <div className={`flex ${containerClass} gap-2`}>
      {/* Agent avatar (for assistant messages) */}
      {!isUser && agentInfo && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#2a2a2a] text-sm flex-shrink-0">
          {agentInfo.icon}
        </div>
      )}

      {/* Message bubble */}
      <div className={`${bubbleClass} rounded-lg px-4 py-3 max-w-md break-words`}>
        {/* Agent badge */}
        {!isUser && agentInfo && (
          <div
            className="text-xs font-bold mb-1 px-2 py-0.5 rounded w-fit"
            style={{ backgroundColor: agentInfo.color }}
          >
            {agentInfo.name}
          </div>
        )}

        {/* Message content */}
        <p className={`text-sm ${isUser ? 'text-white' : 'text-[#e0e0e0]'} whitespace-pre-wrap`}>
          {message.content}
          {isStreaming && <span className="animate-pulse">▌</span>}
        </p>

        {/* Timestamp */}
        <p className="text-xs text-[#6a6a6a] mt-2">
          {new Date(message.created_at).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};
