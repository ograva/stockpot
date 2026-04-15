import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';
import { HomeComponent } from './home/home.component';
import { UsersComponent } from './users/users.component';
import { UserFormComponent } from './users/user-form.component';
import { SettingsComponent } from './settings/settings.component';
import { TenantsComponent } from './tenants/tenants.component';

export const PagesRoutes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
    data: {
      title: 'Home',
      urls: [{ title: 'Home' }],
    },
  },
  {
    path: 'starter',
    component: StarterComponent,
    data: {
      title: 'Dashboard',
      urls: [{ title: 'Home', url: '/dashboard/home' }, { title: 'Dashboard' }],
    },
  },
  {
    path: 'users',
    component: UsersComponent,
    data: {
      title: 'Users',
      urls: [{ title: 'Home', url: '/dashboard/home' }, { title: 'Users' }],
    },
  },
  {
    path: 'users/new',
    component: UserFormComponent,
    data: {
      title: 'New User',
      urls: [
        { title: 'Home', url: '/dashboard/home' },
        { title: 'Users', url: '/dashboard/users' },
        { title: 'New User' },
      ],
    },
  },
  {
    path: 'users/:id/edit',
    component: UserFormComponent,
    data: {
      title: 'Edit User',
      urls: [
        { title: 'Home', url: '/dashboard/home' },
        { title: 'Users', url: '/dashboard/users' },
        { title: 'Edit User' },
      ],
    },
  },
  {
    path: 'settings',
    component: SettingsComponent,
    data: {
      title: 'Settings',
      urls: [{ title: 'Home', url: '/dashboard/home' }, { title: 'Settings' }],
    },
  },
  {
    path: 'tenants',
    component: TenantsComponent,
    data: {
      title: 'Tenants',
      urls: [{ title: 'Home', url: '/dashboard/home' }, { title: 'Tenants' }],
    },
  },
];
