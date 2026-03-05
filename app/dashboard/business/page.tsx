import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';

export default async function BusinessDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.accountType !== 'business') {
    redirect('/dashboard/client');
  }

  // Collect orgs where user is OWNER or MEMBER
  const ownerMemberships = user.memberships.filter(
    (m: { role: string }) => m.role === 'OWNER'
  );
  const staffMemberships = user.memberships.filter(
    (m: { role: string }) => m.role === 'MEMBER'
  );

  const ownedOrgIds = new Set(
    ownerMemberships.map((m: { organisationId: string }) => m.organisationId)
  );
  const legacyOwned = user.ownedOrganisations.filter(
    (o: { id: string }) => !ownedOrgIds.has(o.id)
  );

  return (
    <div className="space-y-8 text-foreground">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Business Dashboard
        </h1>
        <p className="text-foreground/60 mt-2 text-sm">
          Select an organisation to manage your team and bookings.
        </p>
      </div>

      {ownerMemberships.length === 0 &&
      legacyOwned.length === 0 &&
      staffMemberships.length === 0 ? (
        <div className="bg-card rounded-2xl p-12 shadow-sm border border-border text-center transition-all">
          <p className="text-foreground/50 text-sm">
            No organisations found. Complete registration to create your first
            workspace.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Owner Section */}
          {(ownerMemberships.length > 0 || legacyOwned.length > 0) && (
            <div>
              <h2 className="text-xs font-bold text-emerald-primary uppercase tracking-[0.2em] mb-4">
                Organisations You Own
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {ownerMemberships.map(
                  (m: {
                    organisationId: string;
                    organisation: { name: string };
                  }) => (
                    <Link
                      key={m.organisationId}
                      href={`/dashboard/business/${m.organisationId}/admin`}
                      className="group bg-card rounded-xl p-6 shadow-sm border border-border hover:border-emerald-primary/50 hover:bg-emerald-soft/5 transition-all block"
                    >
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-emerald-primary transition-colors">
                        {m.organisation.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-emerald-primary mt-3 font-medium">
                        <span>Admin view</span>
                        <span className="transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </Link>
                  )
                )}
                {/* Legacy Owned Handling */}
                {legacyOwned.map((o: { id: string; name: string }) => (
                  <Link
                    key={o.id}
                    href={`/dashboard/business/${o.id}/admin`}
                    className="group bg-card rounded-xl p-6 shadow-sm border border-border hover:border-emerald-primary/50 hover:bg-emerald-soft/5 transition-all block"
                  >
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-emerald-primary transition-colors">
                      {o.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-emerald-primary mt-3 font-medium">
                      <span>Admin view</span>
                      <span className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Staff Section */}
          {staffMemberships.length > 0 && (
            <div className="pt-4 border-t border-border">
              <h2 className="text-xs font-bold text-foreground/40 uppercase tracking-[0.2em] mb-4">
                Organisations You Work In
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {staffMemberships.map(
                  (m: {
                    organisationId: string;
                    organisation: { name: string };
                  }) => (
                    <Link
                      key={m.organisationId}
                      href={`/dashboard/business/${m.organisationId}/me`}
                      className="group bg-card rounded-xl p-6 shadow-sm border border-border hover:border-emerald-primary/50 hover:bg-emerald-soft/5 transition-all block"
                    >
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-emerald-primary transition-colors">
                        {m.organisation.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-emerald-primary mt-3 font-medium">
                        <span>My bookings</span>
                        <span className="transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </Link>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
