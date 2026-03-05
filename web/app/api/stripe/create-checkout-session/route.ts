import { NextResponse } from "next/server"
import Stripe from "stripe"

function getPriceId(plan: string) {
  switch (plan) {
    case "Starter":
      return process.env.STRIPE_STARTER_PRICE_ID
    case "Growth":
      return process.env.STRIPE_GROWTH_PRICE_ID
    case "Pro":
      return process.env.STRIPE_PRO_PRICE_ID
    default:
      throw new Error("Invalid plan")
  }
}

export async function POST(req: Request) {
  try {
    const { plan } = await req.json()

    const priceId = getPriceId(plan)

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID not configured" },
        { status: 400 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        plan,
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/register?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/register`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Stripe session error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}