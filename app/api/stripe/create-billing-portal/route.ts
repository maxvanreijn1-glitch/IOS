import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (user.accountType !== "business") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 })
  }

  const organisation = user.ownedOrganisations[0]

  if (!organisation?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No Stripe customer found" },
      { status: 400 }
    )
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: organisation.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
  })

  return NextResponse.json({ url: session.url })
}