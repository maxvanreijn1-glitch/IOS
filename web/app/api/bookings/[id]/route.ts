import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getMembership } from "@/lib/authorization"
import { sendEmail } from "@/lib/email"

interface Params {
  params: Promise<{ id: string }>
}

// PATCH /api/bookings/[id]
// CLIENT: may update `reason` for their own booking.
// MEMBER: may update `startTime`, `endTime`, `reason`, `notes` for their assigned booking;
//         rescheduling (changing startTime/endTime) sets status to RESCHEDULED and resets acceptances.
export async function PATCH(req: Request, { params }: Params) {
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

  const body = await req.json()

  if (membership.role === "CLIENT") {
    // CLIENT can only edit reason on their own booking
    if (booking.clientId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { reason } = body
    if (!reason) {
      return NextResponse.json({ error: "reason is required" }, { status: 400 })
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { reason },
    })

    return NextResponse.json({ success: true, booking: updated })
  }

  if (membership.role === "MEMBER") {
    // MEMBER can edit assigned bookings including rescheduling
    if (booking.memberId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { reason, startTime, endTime, notes } = body

    const isRescheduling =
      (startTime !== undefined &&
        new Date(startTime).getTime() !== new Date(booking.startTime).getTime()) ||
      (endTime !== undefined &&
        new Date(endTime).getTime() !== new Date(booking.endTime).getTime())

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(reason !== undefined && { reason }),
        ...(startTime !== undefined && { startTime: new Date(startTime) }),
        ...(endTime !== undefined && { endTime: new Date(endTime) }),
        ...(notes !== undefined && { notes }),
        ...(isRescheduling && {
          status: "RESCHEDULED",
          clientAcceptedAt: null,
          memberAcceptedAt: null,
        }),
      },
    })

    if (isRescheduling) {
      const bookingUrl = `/meetings`
      const subject = `Meeting Rescheduled – ${booking.reason}`
      const html = `<p>The meeting "${booking.reason}" has been rescheduled to ${new Date(startTime ?? booking.startTime).toLocaleString()}.</p>`

      await Promise.allSettled([
        prisma.notification.create({
          data: {
            userId: booking.clientId,
            type: "BOOKING_RESCHEDULED",
            title: "Meeting Rescheduled",
            body: `Your meeting "${booking.reason}" has been rescheduled. Please re-accept.`,
            href: bookingUrl,
          },
        }),
        prisma.notification.create({
          data: {
            userId: booking.memberId,
            type: "BOOKING_RESCHEDULED",
            title: "Meeting Rescheduled",
            body: `The meeting "${booking.reason}" has been rescheduled. Please re-accept.`,
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
    }

    return NextResponse.json({ success: true, booking: updated })
  }

  if (membership.role === "OWNER") {
    // OWNER can update any booking in the org (internalNotes, status, etc.)
    const { reason, startTime, endTime, notes, internalNotes, status } = body

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(reason !== undefined && { reason }),
        ...(startTime !== undefined && { startTime: new Date(startTime) }),
        ...(endTime !== undefined && { endTime: new Date(endTime) }),
        ...(notes !== undefined && { notes }),
        ...(internalNotes !== undefined && { internalNotes }),
        ...(status !== undefined && { status }),
      },
    })

    return NextResponse.json({ success: true, booking: updated })
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}
