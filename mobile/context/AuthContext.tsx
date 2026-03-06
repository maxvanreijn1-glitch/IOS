import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  apiGetCurrentUser,
  apiLogin,
  apiLogout,
  apiRegister,
  clearSession,
} from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string | null;
  accountType: 'client' | 'business';
  subscriptionStatus: string | null;
  memberships: Array<{
    organisationId: string;
    organisationName: string;
    role: string;
  }>;
  ownedOrganisations: Array<{
    id: string;
    name: string;
    subscriptionStatus: string | null;
    plan: string | null;
  }>;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    accountType: 'client' | 'business';
    orgName?: string;
    stripeSessionId?: string;
  }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const userData = await apiGetCurrentUser();
    setUser(userData);
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    await apiLogin(email, password);
    await refreshUser();
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    accountType: 'client' | 'business';
    orgName?: string;
    stripeSessionId?: string;
  }) => {
    await apiRegister(payload);
    await refreshUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
