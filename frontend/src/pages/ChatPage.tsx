import React, { useEffect } from 'react';
import { useChat } from '@hooks/useChat';
import { useStats } from '@hooks/useStats';
import { useAuth } from '@hooks/useAuth';
import { ChatPanel } from '@components/chat/ChatPanel';
import { Sidebar } from '@components/layout/Sidebar';
import { Header } from '@components/layout/Header';

export const ChatPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { messages, sendMessage, createNewSession } = useChat();
  const { stats } = useStats();

  return (
    <div className="h-screen flex flex-col bg-[#0f0f0f]">
      {/* Header */}
      <Header user={user} onLogout={logout} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Sessions */}
        <Sidebar onNewSession={createNewSession} />

        {/* Center - Chat Panel */}
        <div className="flex-1 flex flex-col">
          <ChatPanel messages={messages} onSendMessage={sendMessage} />
        </div>

        {/* Right Sidebar - Agent Stats */}
        <div className="w-64 border-l border-[#2a2a2a] bg-[#1a1a1a] p-4 overflow-y-auto">
          {stats ? (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#e0e0e0] mb-4">Agent Stats</h2>
              {/* Stats will be rendered here */}
              <p className="text-[#a0a0a0] text-sm">Stats loading...</p>
            </div>
          ) : (
            <p className="text-[#a0a0a0] text-sm">Loading agent stats...</p>
          )}
        </div>
      </div>
    </div>
  );
};
