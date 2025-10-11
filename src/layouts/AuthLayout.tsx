import type { ReactNode } from 'react';
import TopMenu from '../components/TopMenu';
import { useTheme } from '../hooks/useTheme';
import { PermissionProvider } from '../contexts/PermissionContext';
import { SaveProvider } from '../contexts/SaveContext';

type AuthLayoutProps = {
  children: ReactNode;
};

  const AuthLayout = ({ children }: AuthLayoutProps) => {
    const { theme, setTheme } = useTheme();
    return (
      <PermissionProvider>
        <SaveProvider>
          <div>
            <TopMenu theme={theme} setTheme={setTheme} />
            <div>
              {children}
            </div>
          </div>
        </SaveProvider>
      </PermissionProvider>
    );
  };

export default AuthLayout