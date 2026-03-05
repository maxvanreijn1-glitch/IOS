import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getMembership, isSubscriptionActive } from "@/lib/authorization"
import { sendEmail } from "@/lib/email"

// GET /api/bookings?orgId=...
// Returns bookings based on the caller's role in the org:
//   OWNER  → all bookings for the org
//   MEMBER → bookings assigned to them in the org
//   CLIENT → their own bookings in the org
export async function GET(req: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const orgId = searchParams.get("orgId")

  if (!orgId) {
    return NextResponse.json({ error: "orgId is required" }, { status: 400 })
  }

  const membership = await getMembership(user.id, orgId)
  if (!membership) {
    return NextResponse.json({ error: "Not a member of this organisation" }, { status: 403 })
  }

  const role = membership.role

  let bookings
  if (role === "OWNER") {
    bookings = await prisma.booking.findMany({
      where: { organisationId: orgId },
      include: {
        client: { select: { id: true, name: true, email: true } },
        member: { select: { id: true, name: true, email: true } },
      },
      orderBy: { startTime: "asc" },
    })
  } else if (role === "MEMBER") {
    bookings = await prisma.booking.findMany({
      where: { organisationId: orgId, memberId: user.id },
      include: {
        client: { select: { id: true, name: true, email: true } },
        member: { select: { id: true, name: true, email: true } },
      },
      orderBy: { startTime: "asc" },
    })
  } else {
    // CLIENT
    bookings = await prisma.booking.findMany({
      where: { organisationId: orgId, clientId: user.id },
      include: {
        client: { select: { id: true, name: true, email: true } },
        member: { select: { id: true, name: true, email: true } },
      },
      orderBy: { startTime: "asc" },
    })
  }

  return NextResponse.json({ bookings })
}

// POST /api/bookings
// Creates a new booking. Caller must be a CLIENT in the org.
// Body: { organisationId, memberId, reason, startTime, endTime }
export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { organisationId, memberId, reason, startTime, endTime } = body

  if (!organisationId || !memberId || !reason || !startTime || !endTime) {
    return NextResponse.json(
      { error: "organisationId, memberId, reason, startTime, and endTime are required" },
      { status: 400 }
    )
  }

  // Validate the caller is a CLIENT in the org
  const clientMembership = await getMembership(user.id, organisationId)
  if (!clientMembership || clientMembership.role !== "CLIENT") {
    return NextResponse.json(
      { error: "You must be a client of this organisation to book a meeting" },
      { status: 403 }
    )
  }

  // Validate organisation subscription is active
  if (!isSubscriptionActive(clientMembership.organisation)) {
    return NextResponse.json(
      { error: "Organisation subscription is not active" },
      { status: 403 }
    )
  }

  // Validate the chosen member is a MEMBER (not OWNER) in the org
  const memberMembership = await getMembership(memberId, organisationId)
  if (!memberMembership || memberMembership.role !== "MEMBER") {
    return NextResponse.json(
      { error: "The selected staff member is not a MEMBER of this organisation" },
      { status: 400 }
    )
  }

  const booking = await prisma.booking.create({
    data: {
      organisationId,
      clientId: user.id,
      memberId,
      reason,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: "PENDING",
    },
    include: {
      member: { select: { id: true, name: true, email: true } },
    },
  })

  // Notify the assigned member
  const bookingUrl = `/meetings`
  await Promise.allSettled([
    prisma.notification.create({
      data: {
        userId: memberId,
        type: "BOOKING_REQUESTED",
        title: "New Meeting Request",
        body: `A new meeting has been requested: "${reason}".`,
        href: bookingUrl,
      },
    }),
    sendEmail({
      to: booking.member.email,
      subject: `New Meeting Request – ${reason}`,
      html: `<p>A client has requested a meeting with you: "${reason}" on ${new Date(startTime).toLocaleString()}.</p>`,
    }).catch((e) => console.error("[email] failed:", e)),
  ])

  return NextResponse.json({ success: true, id: booking.id }, { status: 201 })
}
