import { prisma } from "@/lib/prisma"

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function WaitlistVerifyPage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900">Missing token</h1>
          <p className="text-gray-500 mt-2 text-sm">
            The verification link is incomplete.
          </p>
        </div>
      </div>
    )
  }

  const entry = await prisma.waitlistEntry.findFirst({
    where: { verifyToken: token },
  })

  if (!entry) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900">Invalid link</h1>
          <p className="text-gray-500 mt-2 text-sm">
            This verification link is invalid or has expired.
          </p>
        </div>
      </div>
    )
  }

  if (!entry.verifiedAt) {
    await prisma.waitlistEntry.update({
      where: { id: entry.id },
      data: { verifiedAt: new Date() },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl p-8 text-center">
        <h1 className="text-xl font-bold text-gray-900">Email confirmed</h1>
        <p className="text-gray-500 mt-2 text-sm">
          You’re officially on the MeetFlow waitlist.
        </p>
      </div>
    </div>
  )
}