import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { normalizeBaseUrl } from "@/lib/normalizeUrl"
import { headers } from "next/headers"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })

    // Always return success to avoid email enumeration
    if (!user) {
      return NextResponse.json({ success: true })
    }

    // Expire old unused tokens for this user
    const now = new Date()
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null, expiresAt: { gt: now } },
      data: { expiresAt: now },
    })

    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour
    const resetToken = await prisma.passwordResetToken.create({
      data: { userId: user.id, expiresAt },
    })

    const headersList = await headers()
    const host = headersList.get("host") || ""
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
    const rawBaseUrl = process.env.NEXT_PUBLIC_URL || `${protocol}://${host}`
    const baseUrl = normalizeBaseUrl(rawBaseUrl)
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken.token}`

    await sendEmail({
      to: user.email,
      subject: "Reset your MeetFlow password",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Reset your password</h2>
          <p>We received a request to reset the password for your MeetFlow account.</p>
          <p>Click the button below to choose a new password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#db2777;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
            Reset Password
          </a>
          <p style="margin-top:16px;color:#6b7280;font-size:14px;">Or copy this link: ${resetUrl}</p>
          <p style="color:#6b7280;font-size:14px;">If you did not request a password reset, you can safely ignore this email.</p>
        </div>
      `,
      text: `Reset your MeetFlow password\n\nWe received a request to reset the password for your MeetFlow account.\n\nClick the link below to choose a new password. This link expires in 1 hour.\n\n${resetUrl}\n\nIf you did not request a password reset, you can safely ignore this email.`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
