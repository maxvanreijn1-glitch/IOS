import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const businesses = await prisma.user.findMany({
    where: {
      accountType: "business",
    },
    select: {
      email: true,
      subscriptionPlan: true,
      subscriptionStatus: true,
    },
  })

  return NextResponse.json({ businesses })
}