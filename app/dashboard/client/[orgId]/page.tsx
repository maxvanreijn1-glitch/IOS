import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getMembership } from '@/lib/authorization';
import Link from 'next/link';
import ClientBookingActions from './ClientBookingActions';

interface Props {
  params: Promise<{ orgId: string }>;
}

export default async function ClientOrgDashboardPage({ params }: Props) {
  const { orgId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const membership = await getMembership(user.id, orgId);

  if (!membership || membership.role !== 'CLIENT') {
    redirect('/dashboard/client');
  }

  const bookings = await prisma.booking.findMany({
    where: { organisationId: orgId, clientId: user.id },
    include: {
      member: { select: { id: true, name: true, email: true } },
    },
    orderBy: { startTime: 'asc' },
  });

  const org = membership.organisation;

  return (
    <div className="space-y-6 text-foreground transition-colors duration-300">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{org.name}</h1>
          <p className="opacity-60 mt-1 text-sm">
            Your bookings with this organisation.
          </p>
        </div>
        <Link
          href={`/book?orgId=${orgId}`}
          className="bg-emerald-primary hover:bg-emerald-hover text-white px-4 py-2 rounded-lg font-medium text-sm shadow-sm transition-all active:scale-95"
        >
          + Book a Meeting
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-card rounded-xl p-12 shadow-sm border border-border text-center">
          <p className="opacity-50 text-sm italic">No bookings yet.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-emerald-soft/5 transition-colors"
              >
                <div>
                  <p className="font-semibold text-foreground text-sm uppercase tracking-tight">
                    {b.reason}
                  </p>
                  <p className="text-xs opacity-70 mt-0.5">
                    With{' '}
                    <span className="font-medium text-emerald-primary">
                      {b.member.name || b.member.email}
                    </span>
                  </p>
                  <p className="text-xs opacity-50 font-mono mt-1">
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
                </div>

                <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                  {/* Status Badges updated for Emerald Theme */}
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

                  <ClientBookingActions
                    bookingId={b.id}
                    status={b.status}
                    clientAcceptedAt={b.clientAcceptedAt?.toISOString() ?? null}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
