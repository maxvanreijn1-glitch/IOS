import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getMembership, isSubscriptionActive } from "@/lib/authorization"

// POST /api/meeting-request
// Legacy endpoint kept for backward compatibility.
// Clients must now provide organisationId and a reason.
// Uses the Booking model instead of MeetingRequest.
export async function POST(req: Request) {
  const user = await getCurrentUser()

  if (!user || user.accountType !== "client") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { organisationId, memberId, reason, startTime, endTime, message } =
    await req.json()

  // Resolve the organisation to use
  const resolvedOrgId: string | undefined =
    organisationId ?? user.organisations[0]?.id

  if (!resolvedOrgId) {
    return NextResponse.json(
      { error: "You must belong to an organisation to request a meeting" },
      { status: 403 }
    )
  }

  const membership = await getMembership(user.id, resolvedOrgId)
  if (!membership || membership.role !== "CLIENT") {
    return NextResponse.json(
      { error: "You must be a client of this organisation to request a meeting" },
      { status: 403 }
    )
  }

  if (!isSubscriptionActive(membership.organisation)) {
    return NextResponse.json(
      { error: "Organisation subscription is not active" },
      { status: 403 }
    )
  }

  if (!memberId) {
    return NextResponse.json(
      { error: "A staff member (memberId) is required" },
      { status: 400 }
    )
  }

  const resolvedReason = reason || message
  if (!resolvedReason) {
    return NextResponse.json(
      { error: "reason is required" },
      { status: 400 }
    )
  }

  if (!startTime || !endTime) {
    return NextResponse.json(
      { error: "startTime and endTime are required" },
      { status: 400 }
    )
  }

  // Validate the chosen member has MEMBER role
  const memberMembership = await getMembership(memberId, resolvedOrgId)
  if (!memberMembership || memberMembership.role !== "MEMBER") {
    return NextResponse.json(
      { error: "The selected staff member is not a MEMBER of this organisation" },
      { status: 400 }
    )
  }

  const booking = await prisma.booking.create({
    data: {
      organisationId: resolvedOrgId,
      clientId: user.id,
      memberId,
      reason: resolvedReason,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: "PENDING",
    },
  })

  return NextResponse.json({ success: true, id: booking.id })
}

