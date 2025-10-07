/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface PermissionContextType {
  permissions: string[];
  loading: boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType>({ permissions: [], loading: true, refreshPermissions: async () => {} });

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Explicit refresh function exposed to consumers
  const refreshPermissions = useCallback(async () => {
    setLoading(true);
    if (!token) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/admin/permission', { params: { per_page: 200 } });
      const names = res.data.data.map((p: any) => p.name);
      setPermissions(names);
      try {
        localStorage.setItem('user_permissions', JSON.stringify(names));
      } catch {
        // ignore localStorage failures
      }
    } catch {
      setPermissions([]);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    async function fetchPermissions() {
      setLoading(true);
      // Try localStorage first
      const cached = localStorage.getItem('user_permissions');
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as string[];
          setPermissions(parsed);
          setLoading(false);
          return;
        } catch {
          // fallthrough to fetch from API
        }
      }

      if (token) {
        await refreshPermissions();
      } else {
        setPermissions([]);
        setLoading(false);
      }
    }

    fetchPermissions();
  }, [token, refreshPermissions]);

  return (
    <PermissionContext.Provider value={{ permissions, loading, refreshPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionContext);
}
