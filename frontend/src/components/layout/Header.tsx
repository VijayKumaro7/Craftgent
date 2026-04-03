import React from 'react';
import { User } from '@types/auth';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="border-b border-[#2a2a2a] bg-[#1a1a1a] px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#3b82f6]">⛏ CraftAgent</h1>

        {user && (
          <div className="flex items-center gap-4">
            <span className="text-[#a0a0a0] text-sm">Welcome, {user.username}</span>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm bg-red-900 text-red-100 rounded hover:bg-red-800 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
