'use client';

import { ThemeToggle } from '@/components/ThemeToggle';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md bg-card rounded-xl border border-border shadow-sm p-8">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-xl font-bold text-emerald-primary">MeetFlow</h1>
          <p className="text-2xl font-bold text-foreground mt-4">
            Welcome back
          </p>
          <p className="opacity-70 mt-1 text-sm">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground opacity-80">
              Email
            </label>
            <input
              type="email"
              required
              className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-primary text-foreground"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground opacity-80">
              Password
            </label>
            <input
              type="password"
              required
              className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-primary text-foreground"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Forgot password */}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-xs text-emerald-primary hover:text-emerald-hover font-medium"
            >
              Forgot password?
            </Link>
          </div>

          {/* Error message */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-primary hover:bg-emerald-hover text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 border-t border-border" />

        {/* Create account */}
        <div className="text-center text-sm opacity-80">
          Don’t have an account?{' '}
          <Link
            href="/register"
            className="text-emerald-primary hover:text-emerald-hover font-medium"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
