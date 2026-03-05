import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface Params {
  params: Promise<{ token: string }>
}

export async function POST(_req: Request, { params }: Params) {
  const user = await getCurrentUser()

  if (!user || user.accountType !== "client") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { token } = await params

  const invite = await prisma.invite.findUnique({
    where: { token },
  })

  if (!invite) {
    return NextResponse.json({ error: "Invalid invite" }, { status: 404 })
  }

  await prisma.$transaction([
    prisma.invite.update({
      where: { token },
      data: { usageCount: { increment: 1 } },
    }),
    prisma.organisation.update({
      where: { id: invite.organisationId },
      data: {
        users: {
          connect: { id: user.id },
        },
      },
    }),
    prisma.organisationMembership.upsert({
      where: {
        organisationId_userId: {
          organisationId: invite.organisationId,
          userId: user.id,
        },
      },
      create: {
        organisationId: invite.organisationId,
        userId: user.id,
        role: "CLIENT",
      },
      update: {},
    }),
  ])

  return NextResponse.json({ success: true })
}
