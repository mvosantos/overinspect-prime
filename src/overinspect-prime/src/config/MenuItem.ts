import { FaHome, FaUser, FaCog } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';

export type MenuGroup = {
  title: string;
  icon: React.ElementType;
  items: MenuItem[];
};

export type MenuItem = {
  title: string;
  icon: React.ElementType;
  href: string;
  permission?: string;
  input_type?: string; // Added input_type for service type fields
};

export const menuItems: MenuGroup[] = [
  {
    title: 'Dashboard',
    icon: MdDashboard,
    items: [
      {
        title: 'Home',
        icon: FaHome,
        href: '/home',
      },
      {
        title: 'Profile',
        icon: FaUser,
        href: '/profile',
        permission: 'view_profile',
      },
    ],
  },
  {
    title: 'Settings',
    icon: FaCog,
    items: [
      {
        title: 'Account',
        icon: FaUser,
        href: '/settings/account',
        permission: 'manage_account',
      },
      {
        title: 'Preferences',
        icon: FaCog,
        href: '/settings/preferences',
      },
    ],
  },
];