'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/lib/types';
import { authApi, clearAuthToken, setAuthToken } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<User>;
  register: (name: string, email: string, password?: string, password_confirmation?: string) => Promise<User>;
  fastGuestAuth: (name: string, email: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<User | null>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state
  useEffect(() => {
    async function initAuth() {
      if (typeof window === 'undefined') return;
      const storedToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            // invalid json
          }
        }
        try {
          const profile = await authApi.getMe();
          setUser(profile);
          localStorage.setItem('auth_user', JSON.stringify(profile));
        } catch {
          // Token might be expired
          clearAuthToken();
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    }
    initAuth();
  }, []);

  const login = async (username: string, password?: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ username, password });
      const accessToken = res.token || res.access_token || '';
      setAuthToken(accessToken, true);
      setToken(accessToken);

      const profile = await authApi.getMe();
      const updatedUser: User = {
        ...profile,
        username: profile.username || username,
        name: profile.name || profile.username || username,
        email: profile.email || (username.includes('@') ? username : `${username}@bdris.gov.bd`),
        role: profile.role || (res.role ? res.role : (username.toLowerCase() === 'admin' ? 'admin' : 'user')),
      };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      return updatedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password?: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authApi.register({ name, email, password });
      const accessToken = res.token || res.access_token || '';
      setAuthToken(accessToken, true);
      setToken(accessToken);

      const profile = await authApi.getMe();
      const updatedUser: User = {
        ...profile,
        name: name || profile.name || profile.username || 'Citizen User',
        email: email,
        role: profile.role || 'user',
      };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      return updatedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const fastGuestAuth = async (name: string, email: string): Promise<User> => {
    setIsLoading(true);
    const password = 'User@' + Math.floor(100000 + Math.random() * 900000);
    try {
      // Try to register first
      try {
        return await register(name, email, password);
      } catch (regErr: any) {
        // If user already exists, try logging in with common/default password or report
        if (regErr?.message?.toLowerCase().includes('already') || regErr?.message?.toLowerCase().includes('exist')) {
          try {
            return await login(email, 'User@123456');
          } catch {
            // If registered with custom password, prompt login
            throw new Error('This email is already registered. Please log in with your password.');
          }
        }
        throw regErr;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } finally {
      clearAuthToken();
      setUser(null);
      setToken(null);
      setIsLoading(false);
    }
  };

  const refreshProfile = async (): Promise<User | null> => {
    try {
      const profile = await authApi.getMe();
      setUser(profile);
      localStorage.setItem('auth_user', JSON.stringify(profile));
      return profile;
    } catch {
      return null;
    }
  };

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        fastGuestAuth,
        logout,
        refreshProfile,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
