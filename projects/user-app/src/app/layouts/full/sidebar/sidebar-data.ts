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
    displayName: 'My Profile',
    iconName: 'user-circle',
    route: '/dashboard/profile',
    hideWhenGuest: true,
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
];
