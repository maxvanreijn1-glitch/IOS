const FROM = process.env.EMAIL_FROM

if (!FROM) {
  console.warn(
    "[email] EMAIL_FROM is not set. Emails will not be sent in production."
  )
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[]
  subject: string
  html: string
  text?: string
}) {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.log("[email] RESEND_API_KEY not set – skipping send.")
    console.log("[email] To:", Array.isArray(to) ? to.join(", ") : to)
    console.log("[email] Subject:", subject)
    console.log("[email] Body:", html)
    return
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM || "no-reply@example.com",
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(text && { text }),
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    console.error("[email] Failed to send:", error)
    throw new Error(`Failed to send email: ${error}`)
  }
}
