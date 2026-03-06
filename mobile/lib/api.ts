import AsyncStorage from '@react-native-async-storage/async-storage';

// The base URL of the backend. Override via EXPO_PUBLIC_API_URL env var.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const SESSION_KEY = 'meetflow_session';

/** Persist the session cookie received from the server. */
export async function saveSession(cookie: string): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, cookie);
}

/** Load the stored session cookie. */
export async function loadSession(): Promise<string | null> {
  return AsyncStorage.getItem(SESSION_KEY);
}

/** Clear the stored session. */
export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

/** Extract the session value from a Set-Cookie header string. */
function extractSessionCookie(setCookie: string | null): string | null {
  if (!setCookie) return null;
  const match = setCookie.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

/** Core fetch wrapper that attaches the session cookie. */
async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const session = await loadSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (session) {
    headers['Cookie'] = `session=${session}`;
  }
  return fetch(`${BASE_URL}${path}`, { ...options, headers });
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function apiLogin(email: string, password: string): Promise<void> {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Login failed');
  }
  // Extract and persist session cookie
  const setCookie = res.headers.get('set-cookie');
  const session = extractSessionCookie(setCookie);
  if (session) await saveSession(session);
}

export async function apiLogout(): Promise<void> {
  await apiFetch('/api/auth/logout', { method: 'POST' });
  await clearSession();
}

export async function apiGetCurrentUser(): Promise<any | null> {
  const res = await apiFetch('/api/auth/me');
  if (!res.ok) return null;
  const data = await res.json();
  return data.user ?? null;
}

export async function apiRegister(payload: {
  name: string;
  email: string;
  password: string;
  accountType: 'client' | 'business';
  orgName?: string;
  stripeSessionId?: string;
}): Promise<void> {
  const res = await apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Registration failed');
  }
  const setCookie = res.headers.get('set-cookie');
  const session = extractSessionCookie(setCookie);
  if (session) await saveSession(session);
}

export async function apiForgotPassword(email: string): Promise<void> {
  const res = await apiFetch('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Request failed');
  }
}

export async function apiResetPassword(token: string, password: string): Promise<void> {
  const res = await apiFetch('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Reset failed');
  }
}

export async function apiDeleteAccount(): Promise<void> {
  const res = await apiFetch('/api/auth/account', { method: 'DELETE' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Delete failed');
  }
  await clearSession();
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function apiGetBookings(orgId: string): Promise<any[]> {
  const res = await apiFetch(`/api/bookings?orgId=${encodeURIComponent(orgId)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.bookings ?? [];
}

export async function apiCreateBooking(payload: {
  organisationId: string;
  memberId: string;
  reason: string;
  startTime: string;
  endTime: string;
}): Promise<void> {
  const res = await apiFetch('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to create booking');
  }
}

export async function apiAcceptBooking(id: string): Promise<void> {
  const res = await apiFetch(`/api/bookings/${id}/accept`, { method: 'POST' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to accept booking');
  }
}

export async function apiCancelBooking(id: string): Promise<void> {
  const res = await apiFetch(`/api/bookings/${id}/cancel`, { method: 'POST' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to cancel booking');
  }
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function apiGetNotifications(): Promise<any[]> {
  const res = await apiFetch('/api/notifications');
  if (!res.ok) return [];
  const data = await res.json();
  return data.notifications ?? [];
}

export async function apiMarkNotificationRead(id: string): Promise<void> {
  await apiFetch(`/api/notifications/${id}/read`, { method: 'POST' });
}

// ─── Organisation Members ─────────────────────────────────────────────────────

export async function apiGetOrgMembers(orgId: string): Promise<any[]> {
  const res = await apiFetch(`/api/organisations/${encodeURIComponent(orgId)}/members`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.members ?? [];
}

export async function apiGetOrgClients(orgId: string): Promise<any[]> {
  const res = await apiFetch(`/api/organisations/${encodeURIComponent(orgId)}/clients`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.clients ?? [];
}

// ─── Stripe ──────────────────────────────────────────────────────────────────

export async function apiCreateCheckoutSession(plan: string): Promise<string> {
  const res = await apiFetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Checkout failed');
  }
  const data = await res.json();
  return data.url as string;
}
