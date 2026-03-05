import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getMembership } from '@/lib/authorization';
import Link from 'next/link';
import InviteByEmailForm from './InviteByEmailForm';
import InviteByCodeForm from './InviteByCodeForm';
import AdminBookingActions from './AdminBookingActions';
import {
  ArrowLeft,
  ShieldCheck,
  Users,
  Calendar,
  Briefcase,
} from 'lucide-react';

interface Props {
  params: Promise<{ orgId: string }>;
}

export default async function AdminDashboardPage({ params }: Props) {
  const { orgId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const membership = await getMembership(user.id, orgId);
  const isOwnerByRelation = user.ownedOrganisations.some(
    (o: { id: string }) => o.id === orgId
  );

  if ((!membership || membership.role !== 'OWNER') && !isOwnerByRelation) {
    redirect('/dashboard/business');
  }

  const org = await prisma.organisation.findUnique({
    where: { id: orgId },
    include: {
      memberships: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      bookings: {
        include: {
          client: { select: { id: true, name: true, email: true } },
          member: { select: { id: true, name: true, email: true } },
        },
        orderBy: { startTime: 'asc' },
      },
    },
  });

  if (!org) {
    redirect('/dashboard/business');
  }

  const members = org.memberships.filter(
    (m: { role: string }) => m.role === 'MEMBER'
  );
  const clients = org.memberships.filter(
    (m: { role: string }) => m.role === 'CLIENT'
  );

  return (
    <div className="space-y-8 text-foreground">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-primary mb-1">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              Management Portal
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{org.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              org.subscriptionStatus === 'active'
                ? 'bg-emerald-soft/20 text-emerald-primary border-emerald-primary/20'
                : 'bg-red-500/10 text-red-500 border-red-500/20'
            }`}
          >
            {org.subscriptionStatus ?? 'inactive'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          {
            label: 'Total Bookings',
            value: org.bookings.length,
            icon: Calendar,
          },
          { label: 'Staff Members', value: members.length, icon: Briefcase },
          { label: 'Total Clients', value: clients.length, icon: Users },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-2xl p-6 shadow-sm border border-border group hover:border-emerald-primary/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">
                {stat.label}
              </p>
              <stat.icon
                size={16}
                className="text-emerald-primary opacity-50 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* All Bookings Table-like View */}
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-emerald-soft/5">
              <h2 className="text-sm font-bold uppercase tracking-wider">
                Recent Bookings
              </h2>
            </div>
            {org.bookings.length === 0 ? (
              <p className="px-6 py-12 text-center text-foreground/40 text-sm italic">
                No activity recorded yet.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {org.bookings.map((b) => (
                  <div
                    key={b.id}
                    className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-emerald-soft/5 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {b.reason}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                        <span className="text-[11px] text-emerald-primary font-medium">
                          C: {b.client.name || b.client.email}
                        </span>
                        <span className="text-[11px] text-foreground/30">
                          •
                        </span>
                        <span className="text-[11px] text-foreground/60">
                          S: {b.member.name || b.member.email}
                        </span>
                      </div>
                      <p className="text-[10px] text-foreground/40 mt-1 font-mono uppercase">
                        {new Date(b.startTime).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                    <AdminBookingActions
                      bookingId={b.id}
                      currentStatus={b.status}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          {/* Members List */}
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest">
                Team
              </h2>
              <span className="text-[10px] bg-emerald-primary/10 text-emerald-primary px-2 py-0.5 rounded-full font-bold">
                {members.length}
              </span>
            </div>
            {members.length === 0 ? (
              <p className="px-6 py-6 text-foreground/40 text-xs italic">
                No staff assigned.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {members.map((m) => (
                  <li key={m.id} className="px-6 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-primary/10 border border-emerald-primary/20 flex items-center justify-center text-emerald-primary font-bold text-xs shrink-0">
                      {(m.user.name || m.user.email)[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs truncate">
                        {m.user.name || 'Unnamed Staff'}
                      </p>
                      <p className="text-[10px] text-foreground/50 truncate">
                        {m.user.email}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 px-2">
              Growth & Invites
            </h3>
            <InviteByEmailForm orgId={orgId} />
            <InviteByCodeForm orgId={orgId} />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Link
          href="/dashboard/business"
          className="inline-flex items-center gap-2 text-foreground/40 hover:text-emerald-primary transition-colors text-xs font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={14} />
          Back to organisations
        </Link>
      </div>
    </div>
  );
}
