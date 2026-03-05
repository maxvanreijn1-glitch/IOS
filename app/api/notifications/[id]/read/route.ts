import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface Params {
  params: Promise<{ id: string }>
}

// POST /api/notifications/[id]/read
// Marks a notification as read for the current user
export async function POST(_req: Request, { params }: Params) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const notification = await prisma.notification.findUnique({ where: { id } })

  if (!notification) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 })
  }

  if (notification.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
  })

  return NextResponse.json({ success: true, notification: updated })
}
