import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

interface Params {
  params: Promise<{ token: string }>
}

export async function POST(req: Request, { params }: Params) {
  const { token } = await params

  const invite = await prisma.emailInvite.findUnique({
    where: { token },
    include: { organisation: true },
  })

  if (!invite) {
    return NextResponse.json({ error: "Invalid invite" }, { status: 404 })
  }

  if (invite.acceptedAt) {
    return NextResponse.json(
      { error: "This invite has already been used" },
      { status: 400 }
    )
  }

  const body = await req.json()
  const { name, password } = body

  // Check if user with this email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: invite.email },
  })

  let userId: string

  if (existingUser) {
    // User already exists – add membership and ask them to log in
    userId = existingUser.id

    await prisma.$transaction([
      prisma.emailInvite.update({
        where: { token },
        data: { acceptedAt: new Date(), acceptedUserId: userId },
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
      email: invite.email,
      name: name?.trim() || null,
      password: hashedPassword,
      accountType,
    },
  })
  userId = newUser.id

  await prisma.$transaction([
    prisma.emailInvite.update({
      where: { token },
      data: { acceptedAt: new Date(), acceptedUserId: userId },
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

