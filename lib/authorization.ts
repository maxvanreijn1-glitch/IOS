import { prisma } from "@/lib/prisma"
import { OrgRole } from "@prisma/client"

/**
 * Returns the membership record for the user in the given organisation,
 * or null if they are not a member.
 */
export async function getMembership(userId: string, organisationId: string) {
  return prisma.organisationMembership.findUnique({
    where: {
      organisationId_userId: { organisationId, userId },
    },
    include: { organisation: true },
  })
}

/**
 * Validates that the organisation has an active subscription.
 */
export function isSubscriptionActive(
  org: { subscriptionStatus: string | null }
): boolean {
  return org.subscriptionStatus === "active"
}

/**
 * Checks whether the user has at least the required role in the organisation.
 * Role hierarchy: OWNER > MEMBER > CLIENT
 */
const ROLE_RANK: Record<OrgRole, number> = {
  OWNER: 3,
  MEMBER: 2,
  CLIENT: 1,
}

export function hasRole(userRole: OrgRole, requiredRole: OrgRole): boolean {
  return ROLE_RANK[userRole] >= ROLE_RANK[requiredRole]
}
