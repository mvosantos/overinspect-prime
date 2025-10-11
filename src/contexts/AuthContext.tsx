/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  login as apiLogin,
  saveToken,
  getToken,
  removeToken,
  isTokenValid,
} from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(getToken());
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (token && !isTokenValid(token)) {
      logout();
      setAuthError('Sessão expirada. Faça login novamente.');
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    try {
      setAuthError(null);
      const { token: jwt } = await apiLogin(username, password);
      saveToken(jwt);
      setToken(jwt);

      // Fetch permissions immediately after successful login and cache in localStorage
      try {
        // dynamic import to avoid circular dependency issues
        const apiModule = await import('../services/api');
        type PermissionRes = { data: { data: Array<{ id: string; name: string }> } };
        const res = (await apiModule.default.get('/admin/permission', { params: { per_page: 200 } })) as PermissionRes;
        const names = res.data.data.map((p) => p.name);
        localStorage.setItem('user_permissions', JSON.stringify(names));
      } catch {
        // ignore permissions fetch failure
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAuthError(err.message);
        throw err;
      } else {
        setAuthError('Erro desconhecido ao fazer login.');
        throw new Error('Erro desconhecido ao fazer login.');
      }
    }
  };

  const logout = () => {
    removeToken();
    setToken(null);
    try {
      localStorage.removeItem('user_permissions');
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!token && isTokenValid(token),
      token,
      login,
      logout,
      authError,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
