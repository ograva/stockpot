import { inject, Injector } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { CoreService } from '../services/core.service';

/**
 * Blocks unauthenticated access to any route.
 * Waits for Firebase Auth to resolve from the 'loading' state before deciding.
 * Redirects unauthenticated users to /authentication/login.
 */
export const authGuard: CanActivateFn = () => {
  const core = inject(CoreService);
  const router = inject(Router);
  const injector = inject(Injector);

  return toObservable(core.authStatus, { injector }).pipe(
    filter((status) => status !== 'loading'),
    take(1),
    map((status) =>
      status === 'authenticated'
        ? true
        : router.createUrlTree(['/authentication/login']),
    ),
  );
};
