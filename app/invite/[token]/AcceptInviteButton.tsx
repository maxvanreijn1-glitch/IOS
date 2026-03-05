"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AcceptInviteButton({ token }: { token: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAccept = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/invite/${token}/accept`, {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to accept invite")
        setLoading(false)
        return
      }

      router.push("/dashboard")
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <>
      {error && (
        <p className="mt-4 text-red-500 text-sm">{error}</p>
      )}
      <button
        onClick={handleAccept}
        disabled={loading}
        className="mt-6 w-full bg-pink-600 hover:bg-pink-700 text-white py-2.5 rounded-lg font-medium text-sm transition disabled:opacity-60"
      >
        {loading ? "Accepting..." : "Accept Invitation"}
      </button>
    </>
  )
}
