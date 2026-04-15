import { inject, Injector } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { CoreService } from '../services/core.service';
import { AppUserRole } from '@stockpot/shared';

/**
 * Enforces role-based access on protected routes.
 *
 * Usage — add `data: { roles: ['owner', 'manager'] }` to the route definition.
 * If no `roles` array is provided, any authenticated user with a resolved AppUser is allowed.
 *
 * Role matrix:
 *  owner   — full access to all routes
 *  manager — access to dashboard, kitchen, replenishment; blocked from /settings/master-data
 *  staff   — access to /kitchen only
 *
 * Redirects:
 *  - No AppUser (setup wizard incomplete) → /authentication/login
 *  - Insufficient role → /unauthorized
 */
export const roleGuard: CanActivateFn = (route) => {
  const core = inject(CoreService);
  const router = inject(Router);
  const injector = inject(Injector);

  const allowedRoles = route.data?.['roles'] as AppUserRole[] | undefined;

  return toObservable(core.appUser, { injector }).pipe(
    // Wait until appUser is resolved (not undefined)
    filter((user) => user !== undefined),
    take(1),
    map((user) => {
      if (!user) {
        // No restaurant — setup wizard not completed
        return router.createUrlTree(['/authentication/login']);
      }
      if (!allowedRoles || allowedRoles.includes(user.role)) {
        return true;
      }
      return router.createUrlTree(['/unauthorized']);
    }),
  );
};
