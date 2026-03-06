'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiBase } from '@/lib/api-client';

interface Props {
  bookingId: string;
  status: string;
  clientAcceptedAt: string | null;
}

export default function ClientBookingActions({
  bookingId,
  status,
  clientAcceptedAt,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doAction = async (action: 'accept' | 'cancel') => {
    if (
      action === 'cancel' &&
      !confirm('Are you sure you want to cancel this booking?')
    )
      return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${getApiBase()}/api/bookings/${bookingId}/${action}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Failed to ${action} booking`);
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canAccept = !clientAcceptedAt && status !== 'CANCELLED';
  const canCancel = status !== 'CANCELLED';

  if (!canAccept && !canCancel) return null;

  return (
    <div className="flex items-center gap-4 shrink-0">
      {error && (
        <span className="text-red-500 text-[10px] font-medium animate-pulse">
          {error}
        </span>
      )}

      {canAccept && (
        <button
          onClick={() => doAction('accept')}
          disabled={loading}
          className="text-xs text-emerald-primary hover:text-emerald-hover font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '...' : 'Accept'}
        </button>
      )}

      {canCancel && (
        <button
          onClick={() => doAction('cancel')}
          disabled={loading}
          className="text-xs text-foreground/60 hover:text-red-500 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '...' : 'Cancel'}
        </button>
      )}
    </div>
  );
}
