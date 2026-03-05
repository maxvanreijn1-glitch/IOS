"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (deleteConfirm !== "DELETE") return

    setDeleting(true)
    setDeleteError(null)

    try {
      const res = await fetch("/api/auth/account", { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to delete account")
      }
      await logout()
      router.replace("/login")
    } catch (err: any) {
      setDeleteError(err.message || "Something went wrong")
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* Account info */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Account</h2>
        </div>
        <dl className="divide-y divide-gray-50">
          <div className="px-6 py-3 flex gap-4 text-sm">
            <dt className="font-medium text-gray-600 w-32 shrink-0">Name</dt>
            <dd className="text-gray-900">{user?.name || "—"}</dd>
          </div>
          <div className="px-6 py-3 flex gap-4 text-sm">
            <dt className="font-medium text-gray-600 w-32 shrink-0">Email</dt>
            <dd className="text-gray-900">{user?.email}</dd>
          </div>
          <div className="px-6 py-3 flex gap-4 text-sm">
            <dt className="font-medium text-gray-600 w-32 shrink-0">Account type</dt>
            <dd className="text-gray-900 capitalize">{user?.accountType}</dd>
          </div>
        </dl>
      </section>

      {/* Danger zone */}
      <section className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100">
          <h2 className="text-base font-semibold text-red-600">Danger Zone</h2>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600 mb-5">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>

          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="font-bold">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="DELETE"
              />
            </div>

            {deleteError && (
              <p className="text-red-500 text-sm">{deleteError}</p>
            )}

            <button
              type="submit"
              disabled={deleteConfirm !== "DELETE" || deleting}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2 rounded-lg text-sm transition disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete My Account"}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
