import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getMembership } from "@/lib/authorization"

interface Params {
  params: Promise<{ orgId: string }>
}

// GET /api/organisations/[orgId]/clients
// Returns all CLIENT-role users in the organisation.
// Caller must be an OWNER or MEMBER in the org.
export async function GET(_req: Request, { params }: Params) {
  const { orgId } = await params
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const membership = await getMembership(user.id, orgId)
  const isOwnerByRelation = user.ownedOrganisations.some(
    (o: { id: string }) => o.id === orgId
  )

  if (
    (!membership || (membership.role !== "OWNER" && membership.role !== "MEMBER")) &&
    !isOwnerByRelation
  ) {
    return NextResponse.json(
      { error: "Not authorised to view clients for this organisation" },
      { status: 403 }
    )
  }

  const clients = await prisma.organisationMembership.findMany({
    where: { organisationId: orgId, role: "CLIENT" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  })

  return NextResponse.json({
    clients: clients.map((m) => ({
      userId: m.userId,
      user: m.user,
      role: m.role,
    })),
  })
}
