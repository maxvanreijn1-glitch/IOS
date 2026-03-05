import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { normalizeBaseUrl } from "@/lib/normalizeUrl"
import { headers } from "next/headers"
import { randomUUID } from "crypto"

function isProbablyEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const rawEmail = body?.email

    if (!rawEmail || typeof rawEmail !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const email = rawEmail.trim().toLowerCase()

    if (!isProbablyEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }

    // Create or fetch existing entry.
    // IMPORTANT: verifyToken must be set explicitly because the DB may not have a default,
    // and verifyToken is NOT NULL in your migration.
    const entry = await prisma.WaitlistEntry.upsert({
      where: { email },
      create: {
        email,
        verifyToken: randomUUID(),
      },
      update: {},
    });

    // If they already verified earlier, treat as verified (no new email)
    if (entry.verifiedAt) {
      return NextResponse.json({ status: "verified" })
    }

    // Build base URL
    const headersList = await headers()
    const host = headersList.get("host") || ""
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
    const rawBaseUrl = process.env.NEXT_PUBLIC_URL || `${protocol}://${host}`
    const baseUrl = normalizeBaseUrl(rawBaseUrl)

    const verifyUrl = `${baseUrl}/waitlist/verify?token=${entry.verifyToken}`

    await sendEmail({
      to: entry.email,
      subject: "Confirm your MeetFlow waitlist signup",
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
          <h2>Confirm your email</h2>
          <p>Please confirm your email to join the MeetFlow waitlist.</p>
          <a href="${verifyUrl}" style="display:inline-block;padding:12px 18px;background:#059669;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;">
            Confirm email
          </a>
          <p style="margin-top:16px;color:#6b7280;font-size:14px;">Or copy this link:</p>
          <p style="color:#6b7280;font-size:14px;word-break:break-all;">${verifyUrl}</p>
        </div>
      `,
      text: `Confirm your MeetFlow waitlist signup:\n\n${verifyUrl}\n`,
    })

    return NextResponse.json({ status: "pending_verification" })
  } catch (error) {
    console.error("Waitlist signup error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}