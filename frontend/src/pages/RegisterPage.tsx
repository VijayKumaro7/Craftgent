import React from 'react';
import { RegisterForm } from '@components/auth/RegisterForm';

export const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#10b981] mb-2">⛏ CraftAgent</h1>
          <p className="text-[#a0a0a0]">Join the Agent Command Center</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
};
