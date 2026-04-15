import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';

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
    path: 'profile',
    component: ProfileComponent,
    data: {
      title: 'My Profile',
      urls: [
        { title: 'Home', url: '/dashboard/home' },
        { title: 'My Profile' },
      ],
    },
  },
];
