import { prisma } from "@/lib/prisma"
import CodeJoinForm from "./CodeJoinForm"

interface Props {
  params: Promise<{ code: string }>
}

export default async function JoinCodePage({ params }: Props) {
  const { code } = await params

  const invite = await prisma.codeInvite.findUnique({
    where: { code },
    include: { organisation: true },
  })

  if (!invite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-5">❌</div>
          <h1 className="text-2xl font-bold text-gray-800">Invalid Invite Code</h1>
          <p className="text-gray-500 mt-3 text-sm">
            This invitation code does not exist or is incorrect.
          </p>
        </div>
      </div>
    )
  }

  if (invite.usedAt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-5">✅</div>
          <h1 className="text-2xl font-bold text-gray-800">Invite Already Used</h1>
          <p className="text-gray-500 mt-3 text-sm">
            This one-time invitation code has already been accepted.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900">You&apos;re Invited</h1>
          <p className="text-gray-500 mt-2 text-sm">
            You&apos;ve been invited to join{" "}
            <span className="font-semibold text-gray-800">
              {invite.organisation.name}
            </span>{" "}
            as a {invite.role === "MEMBER" ? "Staff Member" : "Client"}.
          </p>
        </div>
        <CodeJoinForm code={code} orgName={invite.organisation.name} />
      </div>
    </div>
  )
}
