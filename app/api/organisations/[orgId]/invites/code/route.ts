import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getMembership } from "@/lib/authorization"
import { randomBytes } from "crypto"

interface Params {
  params: Promise<{ orgId: string }>
}

// POST /api/organisations/[orgId]/invites/code
// Owner-only: generate a one-time role-encoded invite code
export async function POST(req: Request, { params }: Params) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { orgId } = await params

  const membership = await getMembership(user.id, orgId)
  if (!membership || membership.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden: OWNER only" }, { status: 403 })
  }

  const body = await req.json()
  const { role } = body

  if (role !== "MEMBER" && role !== "CLIENT") {
    return NextResponse.json(
      { error: "role must be MEMBER or CLIENT" },
      { status: 400 }
    )
  }

  // Generate a short, URL-safe code
  const code = randomBytes(6).toString("hex") // 12 hex chars

  const invite = await prisma.codeInvite.create({
    data: {
      code,
      organisationId: orgId,
      role,
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_URL || ""
  const link = `${baseUrl}/join/code/${invite.code}`

  return NextResponse.json({ code: invite.code, link }, { status: 201 })
}
