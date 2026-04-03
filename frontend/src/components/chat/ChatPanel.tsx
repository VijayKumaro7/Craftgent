import React, { useRef, useEffect } from 'react';
import { Message, AgentName } from '@types/chat';
import { ChatBubble } from './ChatBubble';
import { InputBox } from './InputBox';
import { useChatStore } from '@store/chatStore';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string, agent?: AgentName) => Promise<void>;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { streamingText, isStreaming, selectedAgent } = useChatStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <h2 className="text-2xl font-bold text-[#3b82f6] mb-2">Welcome to CraftAgent!</h2>
              <p className="text-[#a0a0a0]">Start a conversation with an AI agent</p>
              <p className="text-sm text-[#6a6a6a] mt-2">Selected Agent: {selectedAgent}</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}

            {/* Streaming Message */}
            {isStreaming && streamingText && (
              <ChatBubble
                message={{
                  id: 'streaming',
                  role: 'assistant',
                  content: streamingText,
                  agent: selectedAgent,
                  created_at: new Date().toISOString(),
                }}
                isStreaming={true}
              />
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-[#2a2a2a] bg-[#1a1a1a] p-6">
        <InputBox onSendMessage={onSendMessage} isLoading={isStreaming} />
      </div>
    </div>
  );
};
