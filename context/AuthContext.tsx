'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '@/lib/api-client'

interface AuthContextType {
  user: any | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (data: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch current user on mount
    const initializeAuth = async () => {
      try {
        const response = await api.auth.getCurrentUser()
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await api.auth.login(email, password)
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new Error(body.error || 'Login failed')
    }
    const meResponse = await api.auth.getCurrentUser()
    if (!meResponse.ok) throw new Error(`Failed to fetch user: ${meResponse.status} ${meResponse.statusText}`)
    const { user: userData } = await meResponse.json()
    setUser(userData)
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  const register = async (data: any) => {
    const response = await api.auth.register(data)
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new Error(body.error || 'Registration failed')
    }
    const meResponse = await api.auth.getCurrentUser()
    if (!meResponse.ok) throw new Error(`Failed to fetch user: ${meResponse.status} ${meResponse.statusText}`)
    const { user: userData } = await meResponse.json()
    setUser(userData)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}