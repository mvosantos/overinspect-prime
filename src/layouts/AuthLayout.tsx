import type { ReactNode } from 'react';
import TopMenu from '../components/TopMenu';
import { useTheme } from '../hooks/useTheme';
import { PermissionProvider } from '../contexts/PermissionContext';
import { SaveProvider } from '../contexts/SaveContext';
import React from 'react';

// Dynamic dev-only debug console
function useDevDebugConsole() {
  const [Comp, setComp] = React.useState<null | React.ComponentType>(null);
  React.useEffect(() => {
    const meta = import.meta as unknown as { env?: { MODE?: string } };
    const isDev = (meta.env && meta.env.MODE !== 'production') || typeof window !== 'undefined';
    if (!isDev) return;
    void import('../components/DebugConsole').then((m) => setComp(() => m.default)).catch(() => {});
  }, []);
  return Comp;
}

type AuthLayoutProps = {
  children: ReactNode;
};

  const AuthLayout = ({ children }: AuthLayoutProps) => {
  const { theme, setTheme } = useTheme();
  const DebugConsole = useDevDebugConsole();
  return (
      <PermissionProvider>
        <SaveProvider>
          <div>
            <TopMenu theme={theme} setTheme={setTheme} />
            <div>
              {children}
            </div>
            {DebugConsole ? <DebugConsole /> : null}
          </div>
        </SaveProvider>
      </PermissionProvider>
    );
  };

export default AuthLayout