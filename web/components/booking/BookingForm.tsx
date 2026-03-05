"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"

interface Member {
  userId: string
  user: { id: string; name: string | null; email: string }
}

interface Props {
  selectedDate: Date
  selectedTime: string
}

export default function BookingForm({
  selectedDate,
  selectedTime,
}: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orgId = searchParams.get("orgId") ?? ""

  const [members, setMembers] = useState<Member[]>([])
  const [memberId, setMemberId] = useState("")
  const [reason, setReason] = useState("")
  const [duration, setDuration] = useState(60) // minutes
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orgId) return
    fetch(`/api/organisations/${orgId}/members`)
      .then((r) => r.json())
      .then((data) => {
        if (data.members) setMembers(data.members)
        else setError(data.error || "Failed to load staff members")
      })
      .catch(() => setError("Failed to load staff members"))
  }, [orgId])

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Reason is required.")
      return
    }
    if (!memberId) {
      setError("Please select a staff member.")
      return
    }
    if (!orgId) {
      setError("Organisation is required. Please go back and select one.")
      return
    }

    setLoading(true)
    setError(null)

    // Build start/end from selectedDate + selectedTime
    const [hours, minutes] = selectedTime.split(":").map(Number)
    const startTime = new Date(selectedDate)
    startTime.setHours(hours, minutes, 0, 0)
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000)

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organisationId: orgId,
          memberId,
          reason: reason.trim(),
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create booking")
        return
      }

      router.push(`/dashboard/client/${orgId}`)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-pink-100">
      <h2 className="font-semibold text-lg mb-4 text-gray-800">Confirm Booking</h2>

      <p className="text-gray-500 text-sm mb-6">
        {selectedDate.toDateString()} at {selectedTime}
      </p>

      <div className="space-y-4">
        {/* Staff member selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Staff Member <span className="text-red-500">*</span>
          </label>
          {members.length === 0 ? (
            <p className="text-sm text-gray-400">
              {orgId
                ? "No staff members available for this organisation."
                : "Select an organisation first (add ?orgId=... to the URL)."}
            </p>
          ) : (
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <option value="">Select a staff member…</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user.name || m.user.email}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Briefly describe the purpose of this meeting…"
            className="block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            <option value={30}>30 minutes</option>
            <option value={60}>60 minutes</option>
            <option value={90}>90 minutes</option>
            <option value={120}>2 hours</option>
          </select>
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl font-semibold shadow-lg shadow-pink-400/40 transition disabled:opacity-60"
        >
          {loading ? "Booking…" : "Confirm Booking"}
        </button>
      </div>
    </div>
  )
}