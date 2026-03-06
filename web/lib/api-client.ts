interface UserData {
  email: string
  password: string
  name?: string
  accountType: string
  orgName?: string
  stripeSessionId?: string
}

interface MeetingData {
  [key: string]: unknown
}

/**
 * Returns the base URL for API requests.
 * When running inside the iOS WKWebView the page is served from a custom
 * scheme (`meetflow://`), so relative paths won't reach the Next.js backend.
 * The iOS app injects `window.MEETFLOW_API_BASE` at document start with the
 * configured backend URL so that all API calls are routed correctly.
 */
export function getApiBase(): string {
  if (typeof window !== 'undefined' && (window as any).MEETFLOW_API_BASE) {
    return (window as any).MEETFLOW_API_BASE as string;
  }
  return '';
}

export const api = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) =>
      fetch(`${getApiBase()}/api/auth/login`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }),
    register: (data: UserData) =>
      fetch(`${getApiBase()}/api/auth/register`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
    getCurrentUser: () =>
      fetch(`${getApiBase()}/api/auth/me`, { method: 'GET', credentials: 'include' }),
  },

  // Meeting endpoints
  meetings: {
    list: () => fetch(`${getApiBase()}/api/meetings`, { method: 'GET', credentials: 'include' }),
    create: (data: MeetingData) =>
      fetch(`${getApiBase()}/api/meetings`, { method: 'POST', credentials: 'include', body: JSON.stringify(data) }),
    update: (id: string, data: MeetingData) =>
      fetch(`${getApiBase()}/api/meetings/${id}`, { method: 'PATCH', credentials: 'include', body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetch(`${getApiBase()}/api/meetings/${id}`, { method: 'DELETE', credentials: 'include' }),
  },

  // Add other endpoints following same pattern
};