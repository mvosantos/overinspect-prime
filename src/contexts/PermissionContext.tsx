/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface PermissionContextType {
  permissions: string[];
  loading: boolean;
}

const PermissionContext = createContext<PermissionContextType>({ permissions: [], loading: true });

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPermissions() {
      if (token) {
        setLoading(true);
        try {
          const res = await api.get('/admin/permission', { params: { per_page: 200 } });
          setPermissions(res.data.data.map((p: any) => p.name));
        } catch {
          setPermissions([]);
        }
        setLoading(false);
      } else {
        setPermissions([]);
        setLoading(false);
      }
    }
    fetchPermissions();
  }, [token]);

  return (
    <PermissionContext.Provider value={{ permissions, loading }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionContext);
}
