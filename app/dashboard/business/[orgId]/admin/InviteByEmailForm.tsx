'use client';

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  orgId: string;
}

export default function InviteByEmailForm({ orgId }: Props) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'MEMBER' | 'CLIENT'>('CLIENT');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/organisations/${orgId}/invites/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to send invite');
        setStatus('error');
        return;
      }

      setStatus('success');
      setEmail('');
      // Reset success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden transition-all">
      <div className="px-6 py-4 border-b border-border bg-emerald-soft/5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
          Invite by Email
        </h2>
        <p className="text-[11px] text-foreground/50 mt-1 uppercase tracking-tight">
          Send a personal invite link to a staff member or client.
        </p>
      </div>

      <div className="px-6 py-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-emerald-primary/50 focus:border-emerald-primary outline-none transition-all placeholder:text-foreground/30"
              />
            </div>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'MEMBER' | 'CLIENT')}
              className="px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-emerald-primary/50 outline-none cursor-pointer hover:border-emerald-primary/30 transition-all text-foreground"
            >
              <option value="CLIENT">Role: Client</option>
              <option value="MEMBER">Role: Staff</option>
            </select>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-2.5 bg-emerald-primary hover:bg-emerald-hover text-white rounded-xl text-sm font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-emerald-primary/20"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Sending</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Invite</span>
                </>
              )}
            </button>
          </div>

          {/* Status Feedback */}
          {status === 'success' && (
            <div className="flex items-center gap-2 mt-2 p-3 bg-emerald-soft/10 border border-emerald-primary/20 rounded-lg text-emerald-primary text-xs font-bold animate-in fade-in slide-in-from-left-2">
              <CheckCircle2 size={14} />
              <span>Invite sent successfully to {email || 'the user'}!</span>
            </div>
          )}

          {status === 'error' && errorMsg && (
            <div className="flex items-center gap-2 mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs font-bold animate-in fade-in slide-in-from-left-2">
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
