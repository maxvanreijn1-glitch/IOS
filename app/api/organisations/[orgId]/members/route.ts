import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getMembership } from "@/lib/authorization"

interface Params {
  params: Promise<{ orgId: string }>
}

// GET /api/organisations/[orgId]/members
// Returns all MEMBER-role users in the organisation.
// Caller must be a CLIENT (or higher) in the org.
export async function GET(_req: Request, { params }: Params) {
  const { orgId } = await params
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const membership = await getMembership(user.id, orgId)
  if (!membership) {
    return NextResponse.json(
      { error: "Not a member of this organisation" },
      { status: 403 }
    )
  }

  const members = await prisma.organisationMembership.findMany({
    where: { organisationId: orgId, role: "MEMBER" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  })

  return NextResponse.json({
    members: members.map((m) => ({
      userId: m.userId,
      user: m.user,
    })),
  })
}
