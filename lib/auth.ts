import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value

  if (!session) return null

  const user = await prisma.user.findUnique({
    where: { id: session },
    include: {
      ownedOrganisations: true,
      organisations: true,
      memberships: {
        include: {
          organisation: true,
        },
      },
    },
  })

  return user
}