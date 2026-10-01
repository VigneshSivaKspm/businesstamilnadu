import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ApiError } from '@/lib/api';
import type { AdminStats, AdminUser } from '@/types';
import { adminApi } from './api';

interface AdminContextValue {
  /** `undefined` while checking the session, `null` when signed out. */
  admin: AdminUser | null | undefined;
  setAdmin: (admin: AdminUser | null) => void;
  signOut: () => Promise<void>;
  stats: AdminStats | undefined;
  refreshStats: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null | undefined>(undefined);
  const [stats, setStats] = useState<AdminStats>();

  useEffect(() => {
    adminApi.auth
      .me()
      .then((r) => setAdmin(r.admin))
      .catch(() => setAdmin(null));
  }, []);

  const refreshStats = useCallback(() => {
    adminApi
      .stats()
      .then(setStats)
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) setAdmin(null);
      });
  }, []);

  useEffect(() => {
    if (admin) refreshStats();
  }, [admin, refreshStats]);

  const signOut = useCallback(async () => {
    try {
      await adminApi.auth.logout();
    } finally {
      setAdmin(null);
      setStats(undefined);
    }
  }, []);

  const value = useMemo(() => ({ admin, setAdmin, signOut, stats, refreshStats }), [admin, signOut, stats, refreshStats]);
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook belongs with its provider
export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside <AdminProvider>');
  return ctx;
}
