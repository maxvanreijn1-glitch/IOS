import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST() {
  const user = await getCurrentUser()

  if (!user || user.accountType !== "business") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const org = user.ownedOrganisations[0]

  if (!org) {
    return NextResponse.json(
      { error: "No organisation found" },
      { status: 403 }
    )
  }

  if (org.subscriptionStatus !== "active") {
    return NextResponse.json(
      { error: "Active subscription required to generate invite links" },
      { status: 403 }
    )
  }

  const invite = await prisma.invite.create({
    data: {
      organisationId: org.id,
    },
  })

  return NextResponse.json({ token: invite.token })
}
