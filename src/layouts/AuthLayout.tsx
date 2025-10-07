import type { ReactNode } from 'react';
import TopMenu from '../components/TopMenu';
import { useTheme } from '../hooks/useTheme';
import { PermissionProvider } from '../contexts/PermissionContext';

type AuthLayoutProps = {
  children: ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const { theme, setTheme } = useTheme();
  return (
    <PermissionProvider>
      <div>
        <TopMenu theme={theme} setTheme={setTheme} />
        <div style={{ marginTop: 60 }}>
          {children}
        </div>
      </div>
    </PermissionProvider>
  );
};

export default AuthLayout