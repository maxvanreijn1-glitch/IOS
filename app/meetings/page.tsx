import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function MeetingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Determine role context.
  // Staff members are invited with role MEMBER and get accountType "business",
  // but they own no organisation.
  const isBusinessOwner =
    user.accountType === "business" && user.ownedOrganisations.length > 0
  const isMember =
    user.accountType === "business" && user.ownedOrganisations.length === 0
  const isClient = user.accountType === "client"

  if (isBusinessOwner) {
    const organisation = user.ownedOrganisations[0]
    if (organisation.subscriptionStatus !== "active") {
      redirect("/register")
    }
  }

  if (isClient && user.organisations.length === 0) {
    redirect("/invite-required")
  }

  // Fetch bookings based on role
  const bookings =
    isBusinessOwner
      ? await prisma.booking.findMany({
          where: { organisationId: user.ownedOrganisations[0].id },
          include: {
            client: { select: { id: true, name: true, email: true } },
            member: { select: { id: true, name: true, email: true } },
            organisation: { select: { id: true, name: true } },
          },
          orderBy: { startTime: "asc" },
        })
      : await prisma.booking.findMany({
          where: { OR: [{ clientId: user.id }, { memberId: user.id }] },
          include: {
            client: { select: { id: true, name: true, email: true } },
            member: { select: { id: true, name: true, email: true } },
            organisation: { select: { id: true, name: true } },
          },
          orderBy: { startTime: "asc" },
        })

  const now = new Date()
  const totalCount = bookings.length
  const upcomingCount = bookings.filter(
    (b) => b.startTime > now && b.status !== "CANCELLED"
  ).length
  const completedCount = bookings.filter(
    (b) => b.endTime < now && b.status !== "CANCELLED"
  ).length

  const statusLabel: Record<string, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    RESCHEDULED: "Rescheduled",
    CANCELLED: "Cancelled",
  }

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-green-100 text-green-700",
    RESCHEDULED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-700",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage and track all your scheduled sessions.
          </p>
        </div>
        {isClient && (
          <a
            href="/book"
            className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition"
          >
            + Book Meeting
          </a>
        )}
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Total</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Upcoming</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{upcomingCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Completed</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{completedCount}</p>
        </div>
      </div>

      {/* Meetings list or empty state */}
      {bookings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="text-center py-16 px-8">
            <div className="text-5xl mb-4">📅</div>
            <h2 className="text-lg font-semibold text-gray-800">No meetings scheduled</h2>
            <p className="text-gray-500 mt-2 text-sm">
              {isClient
                ? "Start by booking your first meeting."
                : "No meetings have been booked yet."}
            </p>
            {isClient && (
              <a
                href="/book"
                className="mt-6 inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition"
              >
                Book Your First Meeting
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {bookings.map((booking) => (
              <div key={booking.id} className="px-6 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{booking.reason}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {new Date(booking.startTime).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                    {" – "}
                    {new Date(booking.endTime).toLocaleTimeString(undefined, {
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {isBusinessOwner ? (
                      <>
                        Client: {booking.client.name || booking.client.email} · Staff:{" "}
                        {booking.member.name || booking.member.email}
                      </>
                    ) : isMember ? (
                      <>Client: {booking.client.name || booking.client.email}</>
                    ) : (
                      <>Staff: {booking.member.name || booking.member.email}</>
                    )}
                    {" · "}
                    {booking.organisation.name}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                    statusColor[booking.status] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {statusLabel[booking.status] ?? booking.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
