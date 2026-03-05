import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getMembership } from "@/lib/authorization"
import { sendEmail } from "@/lib/email"

interface Params {
  params: Promise<{ id: string }>
}

// POST /api/bookings/[id]/cancel
// Allowed for: OWNER of org, assigned MEMBER, or CLIENT owning the booking.
export async function POST(_req: Request, { params }: Params) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true } },
      member: { select: { id: true, name: true, email: true } },
    },
  })

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  const membership = await getMembership(user.id, booking.organisationId)
  if (!membership) {
    return NextResponse.json({ error: "Not a member of this organisation" }, { status: 403 })
  }

  const isOwner = membership.role === "OWNER"
  const isAssignedMember = membership.role === "MEMBER" && booking.memberId === user.id
  const isOwningClient = membership.role === "CLIENT" && booking.clientId === user.id

  if (!isOwner && !isAssignedMember && !isOwningClient) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (booking.status === "CANCELLED") {
    return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 })
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" },
  })

  // Notifications + emails
  const bookingUrl = `/meetings`
  const subject = `Meeting Cancelled – ${booking.reason}`
  const html = `<p>The meeting "${booking.reason}" scheduled for ${new Date(booking.startTime).toLocaleString()} has been cancelled.</p>`

  await Promise.allSettled([
    prisma.notification.create({
      data: {
        userId: booking.clientId,
        type: "BOOKING_CANCELLED",
        title: "Meeting Cancelled",
        body: `The meeting "${booking.reason}" has been cancelled.`,
        href: bookingUrl,
      },
    }),
    prisma.notification.create({
      data: {
        userId: booking.memberId,
        type: "BOOKING_CANCELLED",
        title: "Meeting Cancelled",
        body: `The meeting "${booking.reason}" has been cancelled.`,
        href: bookingUrl,
      },
    }),
    sendEmail({ to: booking.client.email, subject, html }).catch((e) =>
      console.error("[email] failed:", e)
    ),
    sendEmail({ to: booking.member.email, subject, html }).catch((e) =>
      console.error("[email] failed:", e)
    ),
  ])

  return NextResponse.json({ success: true, booking: updated })
}
