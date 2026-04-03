import React, { useState, useEffect } from 'react';
import { useChatStore } from '@store/chatStore';
import { chatAPI } from '@api/chat';

interface SidebarProps {
  onNewSession: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNewSession }) => {
  const { sessions, setSessions } = useChatStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const data = await chatAPI.listSessions(1, 20);
      setSessions(data.items || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="w-64 border-r border-[#2a2a2a] bg-[#1a1a1a] p-4 flex flex-col overflow-hidden">
      {/* New Session Button */}
      <button
        onClick={onNewSession}
        className="w-full mb-4 px-4 py-2 bg-[#10b981] text-white rounded font-medium hover:bg-[#059669] transition-colors"
      >
        + New Session
      </button>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-sm font-bold text-[#a0a0a0] uppercase tracking-wider mb-3">
          Recent Sessions
        </h2>

        {isLoading ? (
          <p className="text-[#6a6a6a] text-sm">Loading...</p>
        ) : sessions.length === 0 ? (
          <p className="text-[#6a6a6a] text-sm">No sessions yet</p>
        ) : (
          <ul className="space-y-2">
            {sessions.map((session) => (
              <li key={session.id}>
                <button className="w-full text-left px-3 py-2 text-sm text-[#a0a0a0] hover:bg-[#2a2a2a] rounded transition-colors truncate">
                  {session.last_message ? session.last_message.substring(0, 30) + '...' : 'Empty session'}
                  <div className="text-xs text-[#6a6a6a] mt-1">
                    {new Date(session.created_at).toLocaleDateString()}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};
