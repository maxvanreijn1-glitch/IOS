"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem("cookie-notice-dismissed")
    if (!dismissed) setVisible(true)
  }, [])

  const dismiss = () => {
    localStorage.setItem("cookie-notice-dismissed", "1")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white text-xs px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 z-50">
      <p>
        This site uses a strictly necessary session cookie to keep you logged in. No tracking or advertising cookies are used.{" "}
        <Link href="/privacy" className="underline hover:text-pink-400">Learn more</Link>.
      </p>
      <button
        onClick={dismiss}
        className="shrink-0 bg-pink-600 hover:bg-pink-700 text-white px-4 py-1.5 rounded-lg transition"
      >
        Got it
      </button>
    </div>
  )
}
