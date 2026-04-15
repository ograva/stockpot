import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { SplashComponent } from './pages/splash/splash.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: FullComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: '/splash',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./pages/pages.routes').then((m) => m.PagesRoutes),
      },
      {
        path: 'settings',
        children: [
          {
            path: 'profile',
            component: ProfileComponent,
          },
          {
            path: 'master-data',
            children: [
              {
                path: 'uoms',
                loadComponent: () =>
                  import('./pages/master-data/uoms/active-uoms.component').then(
                    (m) => m.ActiveUomsComponent,
                  ),
              },
              {
                path: 'raw-materials',
                loadComponent: () =>
                  import('./pages/master-data/raw-materials/raw-materials.component').then(
                    (m) => m.RawMaterialsComponent,
                  ),
              },
              {
                path: 'sub-components',
                loadComponent: () =>
                  import('./pages/master-data/sub-components/sub-components.component').then(
                    (m) => m.SubComponentsComponent,
                  ),
              },
              {
                path: 'recipes',
                loadComponent: () =>
                  import('./pages/master-data/recipes/recipes.component').then(
                    (m) => m.RecipesComponent,
                  ),
              },
              {
                path: 'par-levels',
                loadComponent: () =>
                  import('./pages/master-data/par-levels/par-levels.component').then(
                    (m) => m.ParLevelsComponent,
                  ),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'splash',
        component: SplashComponent,
      },
      {
        path: 'authentication',
        loadChildren: () =>
          import('./pages/authentication/authentication.routes').then(
            (m) => m.AuthenticationRoutes,
          ),
      },
      {
        path: 'unauthorized',
        component: UnauthorizedComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'splash',
  },
];
