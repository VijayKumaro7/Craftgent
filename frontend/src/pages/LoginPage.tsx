import React from 'react';
import { LoginForm } from '@components/auth/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#3b82f6] mb-2">⛏ CraftAgent</h1>
          <p className="text-[#a0a0a0]">Minecraft-style AI Agent Command Center</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};
