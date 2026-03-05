"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!token) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          Invalid or missing reset token. Please request a new password reset.
        </div>
        <Link
          href="/forgot-password"
          className="block w-full text-center bg-pink-600 hover:bg-pink-700 text-white font-medium py-2.5 rounded-lg text-sm transition"
        >
          Request New Reset Link
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to reset password")
      }

      router.replace("/login?message=password-reset")
    } catch (err: any) {
      setError(err.message || "Something went wrong")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-700">New Password</label>
        <input
          type="password"
          required
          minLength={6}
          className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-700">Confirm New Password</label>
        <input
          type="password"
          required
          minLength={6}
          className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-60"
      >
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="mb-7">
          <h1 className="text-xl font-bold text-pink-600">MeetFlow</h1>
          <p className="text-2xl font-bold text-gray-900 mt-4">Set new password</p>
          <p className="text-gray-500 mt-1 text-sm">Choose a strong password for your account.</p>
        </div>

        <Suspense fallback={<p className="text-sm text-gray-500">Loading...</p>}>
          <ResetPasswordForm />
        </Suspense>

        <p className="mt-4 text-center text-sm text-gray-500">
          <Link href="/login" className="text-pink-600 hover:text-pink-700 font-medium">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
