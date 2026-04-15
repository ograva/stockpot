import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Main',
  },
  {
    displayName: 'Home',
    iconName: 'home',
    route: '/dashboard/home',
  },
  {
    displayName: 'Dashboard',
    iconName: 'layout-grid-add',
    route: '/dashboard/starter',
  },
  {
    navCap: 'Auth',
  },
  {
    displayName: 'Login',
    iconName: 'login',
    route: '/authentication/login',
    hideWhenAuth: true,
  },
  {
    displayName: 'Register',
    iconName: 'user-plus',
    route: '/authentication/register',
    hideWhenAuth: true,
  },
  {
    displayName: 'Logout',
    iconName: 'logout',
    isLogout: true,
    hideWhenGuest: true,
  },
  {
    navCap: 'Admin',
    hideWhenGuest: true,
  },
  {
    displayName: 'Users',
    iconName: 'users',
    route: '/dashboard/users',
    hideWhenGuest: true,
  },
  {
    displayName: 'Settings',
    iconName: 'settings',
    route: '/dashboard/settings',
    hideWhenGuest: true,
  },
];
