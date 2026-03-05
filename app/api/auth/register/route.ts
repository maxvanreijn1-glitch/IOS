import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import Stripe from "stripe"

export async function POST(req: Request) {
  try {
    const { email, password, name, accountType, orgName, stripeSessionId } =
      await req.json()

    if (!email || !password || !accountType) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      )
    }

    if (accountType === "business" && (!orgName || !stripeSessionId)) {
      return NextResponse.json(
        { error: "Organisation name and subscription required for business accounts" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password: hashedPassword,
        accountType,
      },
    })

    if (accountType === "business" && orgName && stripeSessionId) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

      const session = await stripe.checkout.sessions.retrieve(
        stripeSessionId,
        { expand: ["subscription"] }
      )

      const subscription = session.subscription as Stripe.Subscription | null
      const rawPlan = session.metadata?.plan?.toUpperCase()
      const validPlans = ["STARTER", "GROWTH", "PRO"] as const
      type PlanType = (typeof validPlans)[number]
      const plan = validPlans.includes(rawPlan as PlanType)
        ? (rawPlan as PlanType)
        : null

      await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
        const org = await tx.organisation.create({
          data: {
            name: orgName,
            ownerUserId: user.id,
            stripeCustomerId: session.customer as string | null,
            stripeSubscriptionId: subscription?.id ?? null,
            subscriptionStatus: subscription?.status ?? null,
            plan,
          },
        })

        await tx.organisationMembership.create({
          data: {
            organisationId: org.id,
            userId: user.id,
            role: "OWNER",
          },
        })
      })
    }

    const response = NextResponse.json({ success: true })

    response.cookies.set("session", user.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}