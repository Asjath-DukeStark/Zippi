import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { api, getToken, setToken } from '../lib/api';
import type { RiderUser, RiderProfile, RiderStats } from '../lib/types';

const PING_INTERVAL_MS = 5000;

interface RiderState {
  user: RiderUser | null;
  profile: RiderProfile | null;
  stats: RiderStats | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  setOnline: (online: boolean) => Promise<void>;
}

const RiderContext = createContext<RiderState>(null as any);
export const useRider = () => useContext(RiderContext);

export function RiderProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<RiderUser | null>(null);
  const [profile, setProfile] = useState<RiderProfile | null>(null);
  const [stats, setStats] = useState<RiderStats | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const d = await api.get<{ user: RiderUser; profile: RiderProfile; stats: RiderStats }>('/rider/me');
    setUser(d.user);
    setProfile(d.profile);
    setStats(d.stats);
  }, []);

  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    refresh().catch(() => setToken(null)).finally(() => setLoading(false));
  }, [refresh]);

  // GPS broadcast loop - while online, ping location to the backend every 5s
  useEffect(() => {
    if (!profile?.isOnline || !navigator.geolocation) return;
    const ping = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          api.patch('/rider/status', {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          }).catch(() => {});
        },
        () => {},
        { timeout: 4000, maximumAge: 4000 }
      );
    };
    ping();
    const t = setInterval(ping, PING_INTERVAL_MS);
    return () => clearInterval(t);
  }, [profile?.isOnline]);

  const login = async (phone: string, password: string) => {
    const d = await api.post<{ user: RiderUser & { role: string }; token: string }>('/auth/login', { phone, password });
    if (d.user.role !== 'rider') throw new Error('This account is not a rider account');
    setToken(d.token);
    await refresh();
  };

  const logout = () => { setToken(null); setUser(null); setProfile(null); setStats(null); };

  const setOnline = async (online: boolean) => {
    let coords: { latitude?: number; longitude?: number } = {};
    if (online && navigator.geolocation) {
      coords = await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          () => resolve({}),
          { timeout: 4000 }
        );
      });
    }
    const d = await api.patch<{ profile: RiderProfile }>('/rider/status', { isOnline: online, ...coords });
    setProfile(d.profile);
  };

  return (
    <RiderContext.Provider value={{ user, profile, stats, loading, login, logout, refresh, setOnline }}>
      {children}
    </RiderContext.Provider>
  );
}
