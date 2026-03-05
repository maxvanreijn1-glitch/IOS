import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      accountType: user.accountType,
      subscriptionStatus: user.subscriptionStatus,
      memberships: user.memberships.map((m: { organisationId: string; organisation: { name: string }; role: string }) => ({
        organisationId: m.organisationId,
        organisationName: m.organisation.name,
        role: m.role,
      })),
      ownedOrganisations: user.ownedOrganisations.map((o: { id: string; name: string; subscriptionStatus: string | null; plan: string | null }) => ({
        id: o.id,
        name: o.name,
        subscriptionStatus: o.subscriptionStatus,
        plan: o.plan,
      })),
    },
  })
}