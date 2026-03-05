'use client';

import { useRegister } from '@/context/RegisterContext';
import BackButton from '@/components/BackButton';
import { useState } from 'react';

export default function AccountForm() {
  const { accountType } = useRegister();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Create account:', accountType, email);
  };

  return (
    <div className="max-w-md mx-auto py-20 px-6 text-foreground">
      <BackButton to="choose-plan" />
      <h1 className="text-3xl font-bold mb-8">
        {accountType === 'business'
          ? 'Create Business Account'
          : 'Create Client Account'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm mb-2 opacity-80">Email</label>
          <input
            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-primary outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-2 opacity-80">Password</label>
          <input
            type="password"
            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-primary outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="w-full bg-emerald-primary hover:bg-emerald-hover text-white py-2.5 rounded-lg transition">
          Create Account
        </button>
      </form>
    </div>
  );
}
