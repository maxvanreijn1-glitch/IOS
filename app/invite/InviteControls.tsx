"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function InviteControls({ initialLink }: { initialLink: string }) {
  const router = useRouter()
  const [inviteLink, setInviteLink] = useState(initialLink)
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setGenerateError(null)
    try {
      const res = await fetch("/api/invite", { method: "POST" })
      const data = await res.json()
      if (res.ok && data.token) {
        setInviteLink(`${window.location.origin}/invite/${data.token}`)
        router.refresh()
      } else {
        setGenerateError(data.error || "Failed to generate new link")
      }
    } catch {
      setGenerateError("Something went wrong. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={inviteLink}
          readOnly
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm focus:outline-none"
        />
        <button
          onClick={handleCopy}
          className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2 rounded-lg font-medium text-sm transition shrink-0"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="self-start text-xs text-pink-600 hover:text-pink-800 underline disabled:opacity-60"
      >
        {generating ? "Generating..." : "Generate new link"}
      </button>
      {generateError && (
        <p className="text-red-500 text-sm">{generateError}</p>
      )}
    </div>
  )
}
