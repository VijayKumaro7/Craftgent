import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

export const RegisterForm: React.FC = () => {
  const { register, isLoading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!username.trim() || !password.trim()) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    try {
      await register(username, password);
    } catch (err) {
      setLocalError(error || 'Registration failed');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-6 text-[#10b981]">CraftAgent Register</h1>

      {(localError || error) && (
        <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded text-red-100 text-sm">
          {localError || error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#e0e0e0] mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-[#e0e0e0] disabled:opacity-50"
            placeholder="Choose a username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#e0e0e0] mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-[#e0e0e0] disabled:opacity-50"
            placeholder="Enter a password (min 6 chars)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#e0e0e0] mb-2">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-[#e0e0e0] disabled:opacity-50"
            placeholder="Confirm your password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-[#10b981] text-white rounded font-medium hover:bg-[#059669] disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p className="text-center text-sm text-[#a0a0a0] mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-[#10b981] hover:text-[#059669]">
          Login here
        </Link>
      </p>
    </div>
  );
};
