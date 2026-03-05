import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const body = await req.text()

  const headerList = await headers()
  const signature = headerList.get("stripe-signature")

  if (!signature) {
    return new NextResponse("Missing signature", { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return new NextResponse("Invalid signature", { status: 400 })
  }

  try {
    switch (event.type) {
      // ✅ Checkout Completed
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        const organisationId = session.metadata?.organisationId
        const plan = session.metadata?.plan

        if (!organisationId || !plan) {
          console.error("Missing metadata")
          break
        }

        const subscriptionId = session.subscription as string
        const customerId = session.customer as string

        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId
        )

        await prisma.organisation.update({
          where: { id: organisationId },
          data: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: subscription.status,
            plan: plan.toUpperCase() as any,
          },
        })

        console.log("Subscription activated for organisation:", organisationId)
        break
      }

      // 🔄 Subscription Updated
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription

        await prisma.organisation.updateMany({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            subscriptionStatus: subscription.status,
          },
        })

        console.log("Subscription updated:", subscription.id)
        break
      }

      // ❌ Subscription Cancelled
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        await prisma.organisation.updateMany({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            subscriptionStatus: "canceled",
          },
        })

        console.log("Subscription cancelled:", subscription.id)
        break
      }
    }

    return new NextResponse(null, { status: 200 })
  } catch (err) {
    console.error("Webhook handler error:", err)
    return new NextResponse("Webhook error", { status: 500 })
  }
}