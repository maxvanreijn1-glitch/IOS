"use client"

import { useAuth } from "@/context/AuthContext"
import { User, Mail, Tag } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 mt-1 text-sm">Your account details.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Avatar header */}
        <div className="bg-pink-50 border-b border-pink-100 px-6 py-8 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-pink-600 text-white flex items-center justify-center text-2xl font-bold shrink-0">
            {(user?.name || user?.email)?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {user?.name || "—"}
            </p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* Details */}
        <dl className="divide-y divide-gray-100">
          <div className="px-6 py-4 flex items-center gap-4">
            <User size={16} className="text-gray-400 shrink-0" />
            <dt className="w-32 text-sm font-medium text-gray-600">Full name</dt>
            <dd className="text-sm text-gray-900">{user?.name || "—"}</dd>
          </div>
          <div className="px-6 py-4 flex items-center gap-4">
            <Mail size={16} className="text-gray-400 shrink-0" />
            <dt className="w-32 text-sm font-medium text-gray-600">Email</dt>
            <dd className="text-sm text-gray-900">{user?.email}</dd>
          </div>
          <div className="px-6 py-4 flex items-center gap-4">
            <Tag size={16} className="text-gray-400 shrink-0" />
            <dt className="w-32 text-sm font-medium text-gray-600">Account type</dt>
            <dd className="text-sm text-gray-900 capitalize">{user?.accountType}</dd>
          </div>
        </dl>
      </div>

      <p className="text-xs text-gray-400">
        To update your account details, contact support or visit{" "}
        <a href="/settings" className="text-pink-600 hover:underline">
          Settings
        </a>
        .
      </p>
    </div>
  )
}