import { saveSession, loadSession, clearSession } from '../lib/api';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Session storage helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saves a session value', async () => {
    await saveSession('user-123');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('meetflow_session', 'user-123');
  });

  it('loads a session value', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('user-123');
    const session = await loadSession();
    expect(session).toBe('user-123');
  });

  it('clears a session', async () => {
    await clearSession();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('meetflow_session');
  });

  it('returns null when no session stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const session = await loadSession();
    expect(session).toBeNull();
  });
});

describe('API module exports', () => {
  it('exports required auth functions', async () => {
    const api = await import('../lib/api');
    expect(typeof api.apiLogin).toBe('function');
    expect(typeof api.apiLogout).toBe('function');
    expect(typeof api.apiGetCurrentUser).toBe('function');
    expect(typeof api.apiRegister).toBe('function');
    expect(typeof api.apiForgotPassword).toBe('function');
    expect(typeof api.apiDeleteAccount).toBe('function');
  });

  it('exports required booking functions', async () => {
    const api = await import('../lib/api');
    expect(typeof api.apiGetBookings).toBe('function');
    expect(typeof api.apiCreateBooking).toBe('function');
    expect(typeof api.apiAcceptBooking).toBe('function');
    expect(typeof api.apiCancelBooking).toBe('function');
  });

  it('exports required notification functions', async () => {
    const api = await import('../lib/api');
    expect(typeof api.apiGetNotifications).toBe('function');
    expect(typeof api.apiMarkNotificationRead).toBe('function');
  });
});
