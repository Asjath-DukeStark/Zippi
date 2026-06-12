import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, getToken, setToken } from '../lib/api';
import type { User } from '../lib/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>(null as any);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    Promise.all([
      api.get<{ user: User }>('/auth/me'),
      api.get<{ store: { currency: string } }>('/settings').catch(() => null)
    ])
      .then(([authData, settingsData]) => {
        if (authData.user.role !== 'admin') throw new Error('Not an admin');
        setUser(authData.user);
        if (settingsData?.store?.currency) {
          localStorage.setItem('zippi_currency', settingsData.store.currency);
        }
      })
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (phone: string, password: string) => {
    const d = await api.post<{ user: User; token: string }>('/auth/login', { phone, password });
    if (d.user.role !== 'admin') throw new Error('This account does not have admin access');
    setToken(d.token);
    setUser(d.user);
    try {
      const settingsData = await api.get<{ store: { currency: string } }>('/settings');
      if (settingsData?.store?.currency) {
        localStorage.setItem('zippi_currency', settingsData.store.currency);
      }
    } catch {}
  };

  const logout = () => { setToken(null); setUser(null); };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}
