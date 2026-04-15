import { Routes } from '@angular/router';

/**
 * Vendor Portal routes.
 *
 * Modules:
 *  - /login      — VNDR-001: Email magic link invite & password link flow
 *  - /catalog    — VNDR-002: Vendor views and edits their product catalogue
 *  - /orders     — VNDR-005: Vendor views orders placed against their catalog
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'catalog',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'catalog',
    loadComponent: () =>
      import('./pages/catalog/catalog.component').then(
        (m) => m.CatalogComponent,
      ),
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./pages/orders/orders.component').then((m) => m.OrdersComponent),
  },
  {
    path: '**',
    redirectTo: 'catalog',
  },
];
