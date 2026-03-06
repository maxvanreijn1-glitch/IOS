"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Sidebar from "@/components/layout/Sidebar"
import Navbar from "@/components/layout/Navbar"
import { useAuth } from "@/context/AuthContext"
import { getApiBase } from "@/lib/api-client"

interface Notification {
  id: string
  type: string
  title: string
  body: string
  href: string | null
  readAt: string | null
  createdAt: string
}

export default function NotificationsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    fetch(`${getApiBase()}/api/notifications`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.notifications) setNotifications(data.notifications)
      })
      .finally(() => setFetching(false))
  }, [user])

  const markRead = async (id: string) => {
    await fetch(`${getApiBase()}/api/notifications/${id}/read`, { method: "POST", credentials: 'include' })
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    )
  }

  if (loading || !user) return null

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h1>

            {fetching ? (
              <p className="text-gray-500 text-sm">Loading…</p>
            ) : notifications.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">
                No notifications yet.
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`bg-white border rounded-xl px-5 py-4 flex items-start gap-4 transition ${
                      n.readAt ? "border-gray-200" : "border-pink-200 bg-pink-50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800">{n.title}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{n.body}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {n.href && (
                        <Link
                          href={n.href}
                          className="text-xs text-pink-600 hover:underline"
                        >
                          View
                        </Link>
                      )}
                      {!n.readAt && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="text-xs text-gray-500 hover:text-gray-700 underline"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
