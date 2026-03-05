import { NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get("session_id")

  if (!sessionId) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_URL}/dashboard`
    )
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  })

  if (session.payment_status !== "paid") {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_URL}/dashboard`
    )
  }

  const userId = session.metadata?.userId
  const plan = session.metadata?.plan

  if (!userId || !plan) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_URL}/dashboard`
    )
  }

  const subscription = session.subscription as Stripe.Subscription

  // Update user subscription
  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      subscriptionPlan: plan,
    },
  })

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_URL}/dashboard`
  )
}