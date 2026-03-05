import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getMembership } from "@/lib/authorization"
import { sendEmail } from "@/lib/email"
import { BookingStatus } from "@prisma/client"

interface Params {
  params: Promise<{ id: string }>
}

// POST /api/bookings/[id]/accept
// CLIENT accepts their booking, or MEMBER accepts their assigned booking.
// When both have accepted, booking becomes CONFIRMED.
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

  const isClient = booking.clientId === user.id
  const isMember = booking.memberId === user.id

  if (!isClient && !isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const now = new Date()
  const updateData: { clientAcceptedAt?: Date; memberAcceptedAt?: Date; status?: BookingStatus } = {}

  if (isClient) {
    if (booking.clientAcceptedAt) {
      return NextResponse.json({ error: "Already accepted" }, { status: 400 })
    }
    updateData.clientAcceptedAt = now
  } else {
    if (booking.memberAcceptedAt) {
      return NextResponse.json({ error: "Already accepted" }, { status: 400 })
    }
    updateData.memberAcceptedAt = now
  }

  // Determine if both will have accepted after this update
  const clientAccepted = isClient ? now : booking.clientAcceptedAt
  const memberAccepted = isMember ? now : booking.memberAcceptedAt

  if (clientAccepted && memberAccepted) {
    updateData.status = BookingStatus.CONFIRMED
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: updateData,
  })

  // Create notifications + send emails when both accepted (CONFIRMED)
  if (updateData.status === "CONFIRMED") {
    const bookingUrl = `/meetings`
    const subject = `Meeting Confirmed – ${booking.reason}`
    const html = `<p>Your meeting on ${new Date(booking.startTime).toLocaleString()} has been confirmed by both parties.</p>`

    await Promise.allSettled([
      prisma.notification.create({
        data: {
          userId: booking.clientId,
          type: "BOOKING_CONFIRMED",
          title: "Meeting Confirmed",
          body: `Your meeting "${booking.reason}" has been confirmed.`,
          href: bookingUrl,
        },
      }),
      prisma.notification.create({
        data: {
          userId: booking.memberId,
          type: "BOOKING_CONFIRMED",
          title: "Meeting Confirmed",
          body: `The meeting "${booking.reason}" has been confirmed.`,
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
  } else {
    // Notify the other party that this party accepted
    const otherUserId = isClient ? booking.memberId : booking.clientId
    await prisma.notification.create({
      data: {
        userId: otherUserId,
        type: "BOOKING_ACCEPTED",
        title: "Meeting Accepted",
        body: `${isClient ? booking.client.name || booking.client.email : booking.member.name || booking.member.email} accepted the meeting "${booking.reason}".`,
        href: `/meetings`,
      },
    })
  }

  return NextResponse.json({ success: true, booking: updated })
}
