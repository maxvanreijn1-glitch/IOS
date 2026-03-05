import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';

export default async function ClientDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.accountType !== 'client') {
    redirect('/dashboard/business');
  }

  const clientMemberships = user.memberships.filter(
    (m: { role: string }) => m.role === 'CLIENT'
  );

  return (
    <div className="space-y-6 text-foreground">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Your Organisations
        </h1>
        <p className="opacity-60 mt-1 text-sm">
          Select an organisation to view your dashboard.
        </p>
      </div>

      {clientMemberships.length === 0 ? (
        <div className="bg-card rounded-xl p-12 shadow-sm border border-border text-center">
          <p className="opacity-50 text-sm">
            You haven&apos;t joined any organisations yet. Ask for an invite
            link.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientMemberships.map(
            (m: { organisationId: string; organisation: { name: string } }) => (
              <Link
                key={m.organisationId}
                href={`/dashboard/client/${m.organisationId}`}
                className="group bg-card rounded-xl p-6 shadow-sm border border-border hover:border-emerald-primary/50 hover:shadow-md hover:bg-emerald-soft/5 transition-all block"
              >
                <h2 className="text-base font-semibold text-foreground group-hover:text-emerald-primary transition-colors">
                  {m.organisation.name}
                </h2>
                <div className="flex items-center gap-2 text-sm text-emerald-primary mt-3 font-medium">
                  <span>View dashboard</span>
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}
