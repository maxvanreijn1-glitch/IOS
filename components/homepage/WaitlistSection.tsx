'use client'

import { useState } from "react"

export function WaitlistSection() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<
    "idle" | "loading" | "pending_verification" | "verified" | "error"
  >("idle")
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setStatus("loading")

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data?.error || "Something went wrong")
        setStatus("error")
        return
      }

      if (data?.status === "verified") {
        setStatus("verified")
        setEmail("")
        return
      }

      setStatus("pending_verification")
      setEmail("")
    } catch {
      setError("Something went wrong")
      setStatus("error")
    }
  }

  return (
    <section className="py-24 border-t border-border bg-emerald-soft/30 dark:bg-emerald-primary/5">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <h2 className="text-3xl font-black mb-4">Be the first to know</h2>
        <p className="text-muted-foreground mb-8 text-lg">
          Join 2,000+ people waiting for the MeetFlow Desktop App. Get early
          access and a 20% discount.
        </p>

        <form
          className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          onSubmit={onSubmit}
        >
          <input
            type="email"
            placeholder="Enter your work email"
            className="flex-1 px-6 py-4 rounded-2xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-primary/50 transition-all"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-emerald-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-primary/20 hover:bg-emerald-hover active:scale-95 transition-all disabled:opacity-60"
          >
            {status === "loading" ? "Joining..." : "Join Waitlist"}
          </button>
        </form>

        {status === "pending_verification" && (
          <p className="mt-4 text-sm text-emerald-700 font-medium">
            Check your email to confirm your spot on the waitlist.
          </p>
        )}

        {status === "verified" && (
          <p className="mt-4 text-sm text-emerald-700 font-medium">
            You’re already confirmed on the waitlist.
          </p>
        )}

        {status === "error" && error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}

        {status === "idle" && (
          <p className="mt-4 text-xs text-muted-foreground italic">
            No spam. Just updates on our progress.
          </p>
        )}
      </div>
    </section>
  );
}