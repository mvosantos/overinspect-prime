Here are the contents for the file `src/components/TopMenu.tsx`:

import { Menubar } from 'primereact/menubar';
import { menuItems, type MenuGroup } from '../config/MenuItem';
import { Fragment } from 'react';
import LanguageSelector from '../components/LanguageSelector';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button } from 'primereact/button';

import { usePermissions } from '../contexts/PermissionContext';

function filterMenuByPermissions(menu: MenuGroup[], permissions: string[]): MenuGroup[] {
  return menu
    .map(group => {
      const filteredItems = group.items.filter(item => {
        if (!item.permission) return true;
        return permissions.includes(item.permission);
      });
      if (filteredItems.length === 0) return null;
      return { ...group, items: filteredItems };
    })
    .filter(Boolean) as MenuGroup[];
}

function mapMenuToMenubar(menu: MenuGroup[], t: (key: string) => string) {
  return menu.map(group => ({
    label: t(group.title),
    icon: () => <group.icon size={18} style={{ marginRight: 8 }} />,
    items: group.items.map(item => ({
      label: t(item.title),
      icon: () => <item.icon size={16} style={{ marginRight: 8 }} />,
      url: item.href,
    })),
  }));
}

export default function TopMenu(props: any) {
  const { t } = useTranslation();
  const { permissions, loading: isLoading } = usePermissions();
  const { logout, token } = useAuth();
  let userName = '';
  let userRole = '';
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    userName = payload.name || '';
    userRole = payload.roles[0] || '';
  }

  if (isLoading) return null;
  if (!permissions) return null;

  const filteredMenu = filterMenuByPermissions(menuItems, permissions);
  const menubarModel = mapMenuToMenubar(filteredMenu, t);

  const endTemplate = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <span style={{ fontWeight: 500 }}>{userName}</span>
      {userRole && <span style={{ fontSize: 12, color: '#888' }}>({userRole})</span>}
      <LanguageSelector flag_layout="side-by-side" userName={userName} />
      <ThemeToggle theme={props.theme} setTheme={props.setTheme} />
      <Button
        onClick={logout} 
        icon="pi pi-sign-out"       
        className='items-center hidden gap-2 text-white md:flex hover:bg-blue-900/50 hover:text-white'
      >
        {t('common:logout')}
      </Button>
    </div>
  );

  const startTemplate = (
    <a href="/home" aria-label="Home - Overinspect" className="flex items-center gap-2">
      <img src="/img/logopeq1.png" alt="Overinspect" className="block h-8 sm:h-10" />
      <span className="hidden text-lg font-semibold sm:inline text-foreground">Overinspect</span>
    </a>
  );

  return (
    <Fragment>
      <style>{`
        .p-menubar .p-menuitem .p-menuitem-link .p-submenu-list {
          min-width: 250px !important;
        }
        .p-menubar .p-submenu-list {
          min-width: 250px !important;
        }
      `}</style>
      <Menubar model={menubarModel} start={startTemplate} end={endTemplate} />
    </Fragment>
  );
}