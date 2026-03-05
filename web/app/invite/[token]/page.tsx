import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import AcceptInviteButton from "./AcceptInviteButton"

interface Props {
  params: Promise<{ token: string }>
}

export default async function InviteTokenPage({ params }: Props) {
  const { token } = await params
  const user = await getCurrentUser()

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { organisation: true },
  })

  // ❌ Invalid token
  if (!invite) {
    return <InvalidInvite />
  }

  // 🔒 Not logged in → send to register WITH token
  if (!user) {
    redirect(`/register?invite=${token}`)
  }

  // 🔒 Must be client
  if (user.accountType !== "client") {
    redirect("/dashboard")
  }

  return (
    <AcceptInvite organisationName={invite.organisation.name} token={token} />
  )
}

/* ============================= */
/* UI COMPONENTS */
/* ============================= */

function AcceptInvite({
  organisationName,
  token,
}: {
  organisationName: string
  token: string
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 max-w-md w-full text-center">

        <div className="text-5xl mb-5">🎉</div>

        <h1 className="text-2xl font-bold text-gray-900">
          You&apos;re Invited
        </h1>

        <p className="text-gray-500 mt-3 text-sm">
          You have been invited to join
        </p>

        <p className="text-base font-semibold text-gray-800 mt-1">
          {organisationName}
        </p>

        <AcceptInviteButton token={token} />

      </div>
    </div>
  )
}

function InvalidInvite() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 max-w-md w-full text-center">

        <div className="text-5xl mb-5">❌</div>

        <h1 className="text-2xl font-bold text-gray-800">
          Invalid Invite Link
        </h1>

        <p className="text-gray-500 mt-3 text-sm">
          This invitation link does not exist or is incorrect.
        </p>

      </div>
    </div>
  )
}
