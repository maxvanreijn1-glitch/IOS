import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { cookies } from "next/headers"

export async function DELETE() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id

    // Delete in dependency order to satisfy FK constraints

    // 1. Delete bookings where user is a client or assigned member
    await prisma.booking.deleteMany({
      where: { OR: [{ clientId: userId }, { memberId: userId }] },
    })

    // 2. Delete meeting requests where user is the client
    await prisma.meetingRequest.deleteMany({ where: { clientId: userId } })

    // 3. Delete explicit memberships for this user
    await prisma.organisationMembership.deleteMany({ where: { userId } })

    // 4. Disconnect user from organisations via the implicit M2M join table
    //    (separate from OrganisationMembership — this is the legacy @relation("OrganisationUsers"))
    await prisma.user.update({
      where: { id: userId },
      data: { organisations: { set: [] } },
    })

    // 5. Handle owned organisations
    const ownedOrgs = await prisma.organisation.findMany({
      where: { ownerUserId: userId },
      select: { id: true },
    })

    for (const org of ownedOrgs) {
      const orgId = org.id

      // Delete org-level bookings
      await prisma.booking.deleteMany({ where: { organisationId: orgId } })

      // Delete org-level meeting requests
      await prisma.meetingRequest.deleteMany({ where: { organisationId: orgId } })

      // Delete invites
      await prisma.invite.deleteMany({ where: { organisationId: orgId } })

      // Delete memberships
      await prisma.organisationMembership.deleteMany({ where: { organisationId: orgId } })

      // Delete the organisation (Prisma cascades the implicit M2M join table entries)
      await prisma.organisation.delete({ where: { id: orgId } })
    }

    // 6. Delete the user
    await prisma.user.delete({ where: { id: userId } })

    // 7. Clear session cookie
    const cookieStore = await cookies()
    cookieStore.delete("session")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete account error:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
