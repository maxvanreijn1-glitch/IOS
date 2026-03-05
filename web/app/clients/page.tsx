"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { Users } from "lucide-react"

export default function ClientsPage() {
  const { user } = useAuth()

  const ownerMemberships = (user?.memberships ?? []).filter(
    (m: { role: string }) => m.role === "OWNER"
  )
  const ownedOrgIds = new Set(
    ownerMemberships.map((m: { organisationId: string }) => m.organisationId)
  )
  const legacyOwned = (user?.ownedOrganisations ?? []).filter(
    (o: { id: string }) => !ownedOrgIds.has(o.id)
  )

  const allOrgs = [
    ...ownerMemberships.map(
      (m: { organisationId: string; organisation: { id: string; name: string } }) =>
        m.organisation
    ),
    ...legacyOwned,
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <p className="text-gray-500 mt-1 text-sm">
          View and manage clients across your organisations.
        </p>
      </div>

      {allOrgs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <Users size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">
            No organisations found.{" "}
            <Link href="/register" className="text-pink-600 hover:underline">
              Complete registration
            </Link>{" "}
            to create one.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {allOrgs.map((org: { id: string; name: string }) => (
            <OrgClientList key={org.id} org={org} />
          ))}
        </div>
      )}
    </div>
  )
}

function OrgClientList({ org }: { org: { id: string; name: string } }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">{org.name}</h2>
          <p className="text-xs text-gray-500 mt-0.5">Organisation clients</p>
        </div>
        <Link
          href={`/dashboard/business/${org.id}/admin`}
          className="text-sm text-pink-600 hover:text-pink-700 font-medium"
        >
          Admin view →
        </Link>
      </div>
      <ClientListInner orgId={org.id} />
    </div>
  )
}

interface Client {
  userId: string
  user: { id: string; name: string | null; email: string }
  role: string
}

function ClientListInner({ orgId }: { orgId: string }) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/organisations/${orgId}/clients`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setClients(data.clients ?? [])
      })
      .catch(() => setError("Failed to load clients"))
      .finally(() => setLoading(false))
  }, [orgId])

  if (loading) {
    return (
      <div className="px-6 py-8 text-center text-sm text-gray-400">
        Loading…
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-6 py-4 text-sm text-red-600">{error}</div>
    )
  }

  if (clients.length === 0) {
    return (
      <div className="px-6 py-8 text-center">
        <p className="text-gray-500 text-sm">No clients yet.</p>
        <p className="text-gray-400 text-xs mt-1">
          Share your{" "}
          <Link href="/invite" className="text-pink-600 hover:underline">
            invite link
          </Link>{" "}
          to bring clients on board.
        </p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-gray-50">
      {clients.map((c) => (
        <li key={c.userId} className="px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-semibold text-sm shrink-0">
            {(c.user.name || c.user.email)[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-800 text-sm truncate">
              {c.user.name || c.user.email}
            </p>
            <p className="text-xs text-gray-500 truncate">{c.user.email}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
