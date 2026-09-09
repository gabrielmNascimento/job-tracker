import { createContext, useContext, useState, type ReactNode } from 'react';
import { api, setAuthToken } from '../lib/api';
import type { AuthUser } from '../types';

const STORAGE_KEY = 'job-tracker:auth';

interface StoredAuth {
  token: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = readStoredAuth();
    if (stored) setAuthToken(stored.token);
    return stored?.user ?? null;
  });

  function persist(auth: StoredAuth) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    setAuthToken(auth.token);
    setUser(auth.user);
  }

  async function login(email: string, password: string) {
    const auth = await api.login(email, password);
    persist(auth);
  }

  async function register(email: string, password: string) {
    const auth = await api.register(email, password);
    persist(auth);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setAuthToken(null);
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
