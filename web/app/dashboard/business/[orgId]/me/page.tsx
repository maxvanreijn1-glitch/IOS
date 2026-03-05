'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Booking {
  id: string;
  reason: string;
  status: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  memberAcceptedAt: string | null;
  client: { id: string; name: string | null; email: string };
}

export default function MemberDashboardPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    startTime: string;
    endTime: string;
    reason: string;
    notes: string;
  }>({ startTime: '', endTime: '', reason: '', notes: '' });

  useEffect(() => {
    fetch(`/api/bookings?orgId=${orgId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          if (data.error === 'Unauthorized') router.replace('/login');
          else setError(data.error);
        } else {
          setBookings(data.bookings);
        }
      })
      .catch(() => setError('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, [orgId, router]);

  const openEdit = (b: Booking) => {
    setEditing(b.id);
    setEditForm({
      startTime: new Date(b.startTime).toISOString().slice(0, 16),
      endTime: new Date(b.endTime).toISOString().slice(0, 16),
      reason: b.reason,
      notes: b.notes ?? '',
    });
  };

  const saveEdit = async (id: string) => {
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startTime: new Date(editForm.startTime).toISOString(),
        endTime: new Date(editForm.endTime).toISOString(),
        reason: editForm.reason,
        notes: editForm.notes,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to update booking');
      return;
    }

    const data = await res.json();
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...data.booking } : b))
    );
    setEditing(null);
  };

  const acceptBooking = async (id: string) => {
    const res = await fetch(`/api/bookings/${id}/accept`, { method: 'POST' });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to accept booking');
      return;
    }
    const data = await res.json();
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...data.booking } : b))
    );
  };

  const cancelBooking = async (id: string) => {
    if (!confirm('Cancel this booking?')) return;
    const res = await fetch(`/api/bookings/${id}/cancel`, { method: 'POST' });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to cancel booking');
      return;
    }
    const data = await res.json();
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...data.booking } : b))
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-8 h-8 border-4 border-emerald-primary/30 border-t-emerald-primary rounded-full animate-spin" />
        <p className="text-foreground/50 text-sm font-medium">
          Loading bookings…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-foreground">
      <div>
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="opacity-60 mt-1 text-sm">
          Bookings assigned to you. You can reschedule or update details.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-4 text-sm font-medium">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-card rounded-xl p-12 shadow-sm border border-border text-center">
          <p className="opacity-50 text-sm italic">
            No bookings assigned to you yet.
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {bookings.map((b) => (
              <div
                key={b.id}
                className={`px-6 py-5 transition-colors ${editing === b.id ? 'bg-emerald-soft/5' : 'hover:bg-emerald-soft/5'}`}
              >
                {editing === b.id ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                          Reason
                        </label>
                        <input
                          type="text"
                          value={editForm.reason}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              reason: e.target.value,
                            }))
                          }
                          className="mt-1 block w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                          Start Time
                        </label>
                        <input
                          type="datetime-local"
                          value={editForm.startTime}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              startTime: e.target.value,
                            }))
                          }
                          className="mt-1 block w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                          End Time
                        </label>
                        <input
                          type="datetime-local"
                          value={editForm.endTime}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              endTime: e.target.value,
                            }))
                          }
                          className="mt-1 block w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-primary outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                        Notes
                      </label>
                      <textarea
                        value={editForm.notes}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, notes: e.target.value }))
                        }
                        rows={2}
                        className="mt-1 block w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-primary outline-none"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => saveEdit(b.id)}
                        className="bg-emerald-primary hover:bg-emerald-hover text-white px-5 py-2 rounded-lg text-sm font-bold transition-all"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="text-foreground opacity-60 hover:opacity-100 px-4 py-2 rounded-lg text-sm font-medium transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-bold text-foreground text-sm uppercase tracking-tight">
                        {b.reason}
                      </p>
                      <p className="text-xs opacity-70">
                        Client:{' '}
                        <span className="font-medium text-emerald-primary">
                          {b.client.name || b.client.email}
                        </span>
                      </p>
                      <p className="text-[11px] opacity-50 font-mono">
                        {new Date(b.startTime).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}{' '}
                        –{' '}
                        {new Date(b.endTime).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                      {b.notes && (
                        <p className="text-xs italic opacity-60 bg-emerald-soft/10 p-2 rounded-md mt-2 border-l-2 border-emerald-primary/30">
                          "{b.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-soft/20 text-emerald-primary border-emerald-primary/20'
                            : b.status === 'RESCHEDULED'
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              : b.status === 'CANCELLED'
                                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                : 'bg-emerald-primary text-white border-transparent'
                        }`}
                      >
                        {b.status}
                      </span>

                      <div className="flex items-center gap-2 ml-2">
                        <button
                          onClick={() => openEdit(b)}
                          className="text-emerald-primary hover:bg-emerald-soft/10 p-2 rounded-lg transition-colors text-xs font-bold"
                        >
                          Edit
                        </button>

                        {!b.memberAcceptedAt && b.status !== 'CANCELLED' && (
                          <button
                            onClick={() => acceptBooking(b.id)}
                            className="bg-emerald-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-hover transition-all shadow-sm"
                          >
                            Accept
                          </button>
                        )}

                        {b.status !== 'CANCELLED' && (
                          <button
                            onClick={() => cancelBooking(b.id)}
                            className="text-foreground/40 hover:text-red-500 p-2 rounded-lg transition-colors text-xs font-bold"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
