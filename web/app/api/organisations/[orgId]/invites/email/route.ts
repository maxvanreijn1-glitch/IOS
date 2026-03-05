import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getMembership } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

interface Params {
  params: Promise<{ orgId: string }>
}

export async function POST(req: Request, { params }: Params) {
  const { orgId } = await params
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check ownership via explicit membership, with fallback to ownedOrganisations relation
  const membership = await getMembership(user.id, orgId)
  const isOwnerByRelation = user.ownedOrganisations.some(
    (o: { id: string }) => o.id === orgId
  )

  if ((!membership || membership.role !== "OWNER") && !isOwnerByRelation) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const org = membership?.organisation ?? (await prisma.organisation.findUnique({ where: { id: orgId } }))

  if (!org) {
    return NextResponse.json({ error: "Organisation not found" }, { status: 404 })
  }

  const body = await req.json()
  const { email, role } = body

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  if (role !== "MEMBER" && role !== "CLIENT") {
    return NextResponse.json({ error: "Role must be MEMBER or CLIENT" }, { status: 400 })
  }

  const normalizedEmail = email.toLowerCase().trim()

  const invite = await prisma.emailInvite.create({
    data: {
      organisationId: orgId,
      email: normalizedEmail,
      role,
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_URL ?? new URL(req.url).origin
  const joinUrl = `${baseUrl}/join/${invite.token}`

  await sendEmail({
    to: normalizedEmail,
    subject: `You've been invited to join ${org.name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>You're invited to join ${org.name}</h2>
        <p>You have been invited as a <strong>${role === "MEMBER" ? "Staff Member" : "Client"}</strong>.</p>
        <p>Click the link below to set your password and join the organisation:</p>
        <a href="${joinUrl}" style="display:inline-block;padding:12px 24px;background:#db2777;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
          Accept Invitation
        </a>
        <p style="margin-top:16px;color:#6b7280;font-size:14px;">Or copy this link: ${joinUrl}</p>
      </div>
    `,
  })

  return NextResponse.json({ success: true })
}
