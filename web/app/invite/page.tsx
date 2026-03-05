import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import InviteControls from "./InviteControls"

export default async function InvitePage() {
  const user = await getCurrentUser()

  // 🔒 Must be logged in
  if (!user) {
    redirect("/login")
  }

  // 🔒 Only businesses allowed
  if (user.accountType !== "business") {
    redirect("/dashboard")
  }

  const organisation = user.ownedOrganisations[0]

  if (!organisation) {
    redirect("/register")
  }

  if (organisation.subscriptionStatus !== "active") {
    redirect("/register")
  }

  // Find the latest invite for this organisation, or create a new one
  let invite = await prisma.invite.findFirst({
    where: {
      organisationId: organisation.id,
    },
    orderBy: { createdAt: "desc" },
  })

  if (!invite) {
    invite = await prisma.invite.create({
      data: {
        organisationId: organisation.id,
      },
    })
  }

  const headersList = await headers()
  const host = headersList.get("host") || ""
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
  const baseUrl = process.env.NEXT_PUBLIC_URL || `${protocol}://${host}`
  const inviteLink = `${baseUrl}/invite/${invite.token}`

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invite Clients</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Generate a private invite link for your organisation.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-800">
              {organisation.name}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Organisation</p>
          </div>

          {/* Invite Section */}
          <div className="px-6 py-5">
            <p className="text-sm text-gray-600 mb-4">
              Share this link with clients to invite them to your organisation.
              The link never expires and can be used multiple times.
            </p>
            <InviteControls initialLink={inviteLink} />
          </div>
        </div>

        {/* Info cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h4 className="font-semibold text-gray-800 text-sm">Private</h4>
            <p className="text-gray-500 mt-1 text-xs">
              Each invite token belongs only to your organisation.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h4 className="font-semibold text-gray-800 text-sm">No Expiry</h4>
            <p className="text-gray-500 mt-1 text-xs">
              Invite links never expire and can be used multiple times.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h4 className="font-semibold text-gray-800 text-sm">Secure</h4>
            <p className="text-gray-500 mt-1 text-xs">
              Tokens are unique and cannot overlap with other businesses.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}