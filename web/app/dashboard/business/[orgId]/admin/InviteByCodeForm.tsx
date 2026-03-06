'use client';

import { useState } from 'react';
import {
  Hash,
  Copy,
  Check,
  Loader2,
  Link as LinkIcon,
  AlertCircle,
} from 'lucide-react';
import { getApiBase } from '@/lib/api-client';

interface Props {
  orgId: string;
}

export default function InviteByCodeForm({ orgId }: Props) {
  const [role, setRole] = useState<'MEMBER' | 'CLIENT'>('CLIENT');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [result, setResult] = useState<{ code: string; link: string } | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setStatus('loading');
    setErrorMsg(null);
    setResult(null);
    setCopied(false);

    try {
      const res = await fetch(`${getApiBase()}/api/organisations/${orgId}/invites/code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to generate code');
        setStatus('error');
        return;
      }

      setResult(data);
      setStatus('success');
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden transition-all">
      <div className="px-6 py-4 border-b border-border bg-emerald-soft/5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
          Invite by Code
        </h2>
        <p className="text-[11px] text-foreground/50 mt-1 uppercase tracking-tight">
          Generate a secure one-time link for staff or clients.
        </p>
      </div>

      <div className="px-6 py-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'MEMBER' | 'CLIENT')}
            className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-emerald-primary/50 outline-none cursor-pointer hover:border-emerald-primary/30 transition-all text-foreground"
          >
            <option value="CLIENT">Role: Client</option>
            <option value="MEMBER">Role: Staff Member</option>
          </select>

          <button
            onClick={handleGenerate}
            disabled={status === 'loading'}
            className="px-6 py-2.5 bg-emerald-primary hover:bg-emerald-hover text-white rounded-xl text-sm font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-emerald-primary/10"
          >
            {status === 'loading' ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Generating</span>
              </>
            ) : (
              <>
                <Hash size={16} />
                <span>Generate Code</span>
              </>
            )}
          </button>
        </div>

        {status === 'success' && result && (
          <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-4 bg-emerald-soft/10 border border-emerald-primary/20 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-primary uppercase tracking-widest">
                  Access Details
                </span>
                <span className="text-[10px] bg-emerald-primary text-white px-2 py-0.5 rounded-full">
                  One-time Use
                </span>
              </div>

              <div className="space-y-3">
                {/* Code Field */}
                <div className="flex items-center justify-between bg-background/50 p-2 rounded-lg border border-border">
                  <span className="text-xs font-mono text-foreground/70 pl-2">
                    {result.code}
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.code)}
                    className="p-1.5 hover:bg-emerald-primary/10 rounded-md text-emerald-primary transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                </div>

                {/* Link Field */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-background/50 p-2 rounded-lg border border-border truncate text-[11px] text-foreground/50 font-mono">
                    {result.link}
                  </div>
                  <button
                    onClick={() => copyToClipboard(result.link)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      copied
                        ? 'bg-emerald-primary text-white'
                        : 'bg-emerald-primary/10 text-emerald-primary hover:bg-emerald-primary/20'
                    }`}
                  >
                    {copied ? <Check size={14} /> : <LinkIcon size={14} />}
                    <span>{copied ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {status === 'error' && errorMsg && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs font-bold animate-in fade-in">
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
