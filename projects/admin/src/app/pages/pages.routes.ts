import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';
import { HomeComponent } from './home/home.component';
import { UsersComponent } from './users/users.component';
import { UserFormComponent } from './users/user-form.component';
import { SettingsComponent } from './settings/settings.component';
import { TenantsComponent } from './tenants/tenants.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UomComponent } from './catalog/uom/uom.component';
import { IngredientsComponent } from './catalog/ingredients/ingredients.component';
import { SuppliersComponent } from './catalog/suppliers/suppliers.component';
import { SupplierDetailComponent } from './catalog/suppliers/supplier-detail.component';
import { AdminProfileComponent } from './profile/profile.component';

export const PagesRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    data: {
      title: 'Platform Dashboard',
      urls: [{ title: 'Dashboard' }],
    },
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
      urls: [{ title: 'Dashboard', url: '/dashboard/dashboard' }, { title: 'Tenants' }],
    },
  },
  {
    path: 'catalog/uom',
    component: UomComponent,
    data: {
      title: 'Units of Measure',
      urls: [
        { title: 'Dashboard', url: '/dashboard/dashboard' },
        { title: 'Catalog' },
        { title: 'UoMs' },
      ],
    },
  },
  {
    path: 'catalog/ingredients',
    component: IngredientsComponent,
    data: {
      title: 'Ingredient Catalog',
      urls: [
        { title: 'Dashboard', url: '/dashboard/dashboard' },
        { title: 'Catalog' },
        { title: 'Ingredients' },
      ],
    },
  },
  {
    path: 'catalog/suppliers',
    component: SuppliersComponent,
    data: {
      title: 'Suppliers',
      urls: [
        { title: 'Dashboard', url: '/dashboard/dashboard' },
        { title: 'Catalog' },
        { title: 'Suppliers' },
      ],
    },
  },
  {
    path: 'catalog/suppliers/:vendorId',
    component: SupplierDetailComponent,
    data: {
      title: 'Supplier Detail',
      urls: [
        { title: 'Dashboard', url: '/dashboard/dashboard' },
        { title: 'Suppliers', url: '/dashboard/catalog/suppliers' },
        { title: 'Detail' },
      ],
    },
  },
  {
    path: 'profile',
    component: AdminProfileComponent,
    data: {
      title: 'Operator Profile',
      urls: [{ title: 'Dashboard', url: '/dashboard/dashboard' }, { title: 'Profile' }],
    },
  },
];
