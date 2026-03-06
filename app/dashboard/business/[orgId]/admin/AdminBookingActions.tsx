'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { getApiBase } from '@/lib/api-client';

interface Props {
  bookingId: string;
  currentStatus: string;
}

const STATUSES = ['PENDING', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED'] as const;

// Helper to define color logic for the status dots
const getStatusStyles = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-emerald-primary';
    case 'PENDING':
      return 'bg-blue-400';
    case 'RESCHEDULED':
      return 'bg-amber-400';
    case 'CANCELLED':
      return 'bg-red-500';
    default:
      return 'bg-foreground/20';
  }
};

export default function AdminBookingActions({
  bookingId,
  currentStatus,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (status: string) => {
    if (status === currentStatus) return;

    setLoading(true);
    setError(null);

    try {
      if (status === 'CANCELLED') {
        if (
          !confirm(
            'Are you sure you want to cancel this booking? Notifications will be sent to the client.'
          )
        ) {
          setLoading(false);
          return;
        }
        const res = await fetch(`${getApiBase()}/api/bookings/${bookingId}/cancel`, {
          method: 'POST',
          credentials: 'include',
        });
        if (!res.ok)
          throw new Error((await res.json()).error || 'Failed to cancel');
      } else {
        const res = await fetch(`${getApiBase()}/api/bookings/${bookingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status }),
        });
        if (!res.ok)
          throw new Error((await res.json()).error || 'Failed to update');
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1.5 shrink-0">
      <div className="relative group">
        {/* Status Dot */}
        <div
          className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full z-10 ${getStatusStyles(currentStatus)}`}
        />

        <select
          value={currentStatus}
          onChange={(e) => updateStatus(e.target.value)}
          disabled={loading || currentStatus === 'CANCELLED'}
          className={`
            pl-6 pr-8 py-1.5 text-[10px] font-bold uppercase tracking-wider
            bg-background border border-border rounded-lg 
            appearance-none cursor-pointer outline-none
            transition-all hover:border-emerald-primary/50 focus:ring-2 focus:ring-emerald-primary/20
            disabled:opacity-50 disabled:cursor-not-allowed
            text-foreground
          `}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s} className="bg-card text-foreground">
              {s}
            </option>
          ))}
        </select>

        {/* Custom Chevron or Loading Spinner */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/30">
          {loading ? (
            <Loader2 size={12} className="animate-spin text-emerald-primary" />
          ) : (
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M1 1L5 5L9 1" />
            </svg>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-1 text-red-500 animate-in fade-in slide-in-from-right-1">
          <AlertCircle size={10} />
          <span className="text-[10px] font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}
