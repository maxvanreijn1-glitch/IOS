import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// POST /api/join/code
// Body: { code, email, name?, password }
// Validates one-time code, creates user if needed, creates membership with role from invite
export async function POST(req: Request) {
  const body = await req.json()
  const { code, email, name, password } = body

  if (!code || !email) {
    return NextResponse.json({ error: "code and email are required" }, { status: 400 })
  }

  const invite = await prisma.codeInvite.findUnique({
    where: { code },
    include: { organisation: true },
  })

  if (!invite) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 404 })
  }

  if (invite.usedAt) {
    return NextResponse.json(
      { error: "This invite code has already been used" },
      { status: 400 }
    )
  }

  const normalizedEmail = email.trim().toLowerCase()

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })

  let userId: string

  if (existingUser) {
    userId = existingUser.id

    await prisma.$transaction([
      prisma.codeInvite.update({
        where: { code },
        data: { usedAt: new Date(), usedByUserId: userId },
      }),
      prisma.organisationMembership.upsert({
        where: {
          organisationId_userId: {
            organisationId: invite.organisationId,
            userId,
          },
        },
        create: { organisationId: invite.organisationId, userId, role: invite.role },
        update: {},
      }),
    ])

    return NextResponse.json({ success: true, requiresLogin: true })
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    )
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const accountType = invite.role === "MEMBER" ? "business" : "client"

  const newUser = await prisma.user.create({
    data: {
      email: normalizedEmail,
      name: name?.trim() || null,
      password: hashedPassword,
      accountType,
    },
  })
  userId = newUser.id

  await prisma.$transaction([
    prisma.codeInvite.update({
      where: { code },
      data: { usedAt: new Date(), usedByUserId: userId },
    }),
    prisma.organisationMembership.upsert({
      where: {
        organisationId_userId: {
          organisationId: invite.organisationId,
          userId,
        },
      },
      create: { organisationId: invite.organisationId, userId, role: invite.role },
      update: {},
    }),
  ])

  const response = NextResponse.json({ success: true })
  response.cookies.set("session", userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })

  return response
}
