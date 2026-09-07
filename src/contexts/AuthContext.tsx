import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, getToken, setToken, clearToken, getStoredUser, setStoredUser } from '../lib/api';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(getStoredUser());
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authApi.login(email, password);
      setToken(data.session.access_token);
      setStoredUser(data.user);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: 'customer' | 'worker' | 'cooperative') => {
    setIsLoading(true);
    try {
      const data = await authApi.demoLogin(role);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: any) => {
    setIsLoading(true);
    try {
      const data = await authApi.register(payload);
      if (data.session?.access_token) {
        setToken(data.session.access_token);
        setStoredUser(data.user);
        setUser(data.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

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
