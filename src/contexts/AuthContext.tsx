import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  authApi,
  getToken,
  setToken,
  clearToken,
  getStoredUser,
  setStoredUser,
  getRefreshToken,
  setRefreshToken,
} from '../lib/api';
import { backendRoleToFrontend } from '../lib/apiAdapters';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: (role: 'customer' | 'worker' | 'cooperative') => Promise<void>;
  logout: () => void;
  register: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Persist a full session object returned by any auth endpoint */
function persistSession(user: any, session: any) {
  if (session?.access_token) setToken(session.access_token);
  if (session?.refresh_token) setRefreshToken(session.refresh_token);
  if (user) setStoredUser(user);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(() => {
    const stored = getStoredUser();
    if (stored?.role) return { ...stored, role: backendRoleToFrontend(stored.role) };
    return stored;
  });
  const [isLoading, setIsLoading] = useState(true); // start true; resolved after mount refresh attempt

  // ── Silent token refresh on mount ────────────────────────────────────────
  // If we have a stored access token we attempt to refresh it immediately so
  // it is always fresh when the page loads.  Supabase access tokens expire in
  // 1 h; without this, a user who reopens the tab after an hour would get 401s
  // on every request until they manually log in again.
  useEffect(() => {
    const attemptSilentRefresh = async () => {
      const storedToken = getToken();
      const storedRefresh = getRefreshToken();

      // Nothing stored → not logged in, nothing to do
      if (!storedToken && !storedRefresh) {
        setIsLoading(false);
        return;
      }

      // Demo tokens never expire — skip refresh entirely
      if (storedToken?.startsWith('demo-token-')) {
        setIsLoading(false);
        return;
      }

      // Try to get a fresh access token
      if (storedRefresh) {
        try {
          const res = await fetch(
            `${(import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')}/api/auth/refresh`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh_token: storedRefresh }),
            }
          );

          if (res.ok) {
            const body = await res.json();
            const newAccess = body?.data?.session?.access_token;
            const newRefresh = body?.data?.session?.refresh_token;

            if (newAccess) {
              setToken(newAccess);
              if (newRefresh) setRefreshToken(newRefresh);
              // Token refreshed — existing stored user is still valid
              setIsLoading(false);
              return;
            }
          }

          // Refresh endpoint returned an error — session is unrecoverable
          clearToken();
          setUser(null);
        } catch {
          // Network error during refresh — don't log out, just keep the
          // existing (possibly expired) token; the request() function in
          // api.ts will handle 401s if it actually is expired
        }
      }

      setIsLoading(false);
    };

    attemptSilentRefresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── React to token being cleared by api.ts 401 handler ───────────────────
  // When request() clears a stale token (after a failed refresh), we need to
  // update React state so isAuthenticated becomes false and the UI shows the
  // login screen.  We poll lightweight rather than using a storage event so
  // it works within the same tab.
  useEffect(() => {
    const interval = setInterval(() => {
      if (user && !getToken()) {
        setUser(null);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [user]);

  // ── Auth actions ─────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authApi.login(email, password);
      const frontendUser = { ...data.user, role: backendRoleToFrontend(data.user.role) };
      persistSession(frontendUser, data.session);
      setUser(frontendUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const demoLogin = useCallback(async (role: 'customer' | 'worker' | 'cooperative') => {
    setIsLoading(true);
    try {
      const data = await authApi.demoLogin(role);
      const frontendUser = { ...data.user, role: backendRoleToFrontend(data.user.role) };
      persistSession(frontendUser, data.session);
      setUser(frontendUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: any) => {
    setIsLoading(true);
    try {
      const data = await authApi.register(payload);
      if (data.session?.access_token) {
        const frontendUser = { ...data.user, role: backendRoleToFrontend(data.user.role) };
        persistSession(frontendUser, data.session);
        setUser(frontendUser);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user && !!getToken(),
      login,
      demoLogin,
      logout,
      register,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
