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

export const api = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) => 
      fetch('/api/auth/login', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }),
    register: (data: UserData) => 
      fetch('/api/auth/register', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
    getCurrentUser: () => 
      fetch('/api/auth/me', { method: 'GET', credentials: 'same-origin' }),
  },
  
  // Meeting endpoints
  meetings: {
    list: () => fetch('/api/meetings', { method: 'GET' }),
    create: (data: MeetingData) => 
      fetch('/api/meetings', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: MeetingData) => 
      fetch(`/api/meetings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => 
      fetch(`/api/meetings/${id}`, { method: 'DELETE' }),
  },
  
  // Add other endpoints following same pattern
};