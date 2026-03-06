"use client"

import { useState } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/ThemeToggle"
import { getApiBase } from "@/lib/api-client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`${getApiBase()}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Something went wrong")
      }

      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative transition-colors duration-300">
      {/* Theme Toggle Positioned Top-Right */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-card rounded-xl border border-border shadow-sm p-8 transition-all">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-xl font-bold text-emerald-primary">MeetFlow</h1>
          <p className="text-2xl font-bold text-foreground mt-4">Reset your password</p>
          <p className="opacity-70 mt-1 text-sm text-foreground">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="bg-emerald-soft/20 border border-emerald-primary/30 rounded-lg px-4 py-3 text-sm text-emerald-primary">
              If an account with that email exists, a password reset link has been sent. Please check your inbox.
            </div>
            <Link
              href="/login"
              className="block w-full text-center bg-emerald-primary hover:bg-emerald-hover text-white font-medium py-2.5 rounded-lg text-sm transition shadow-sm"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium opacity-80 text-foreground">Email</label>
              <input
                type="email"
                required
                className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-primary text-foreground transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-primary hover:bg-emerald-hover text-white font-medium py-2.5 rounded-lg text-sm transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <p className="text-center text-sm opacity-70 text-foreground">
              Remember your password?{" "}
              <Link href="/login" className="text-emerald-primary hover:text-emerald-hover font-medium">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}