import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs/operators';
import { CoreService } from 'src/app/services/core.service';

export const AuthGuard: CanActivateFn = () => {
  const core = inject(CoreService);
  const router = inject(Router);

  // Wait until Firebase has resolved auth state (skip 'loading')
  return toObservable(core.currentUser).pipe(
    filter((user) => user !== undefined),
    take(1),
    map((user) => {
      if (user !== null) return true;
      return router.createUrlTree(['/authentication/login']);
    }),
  );
};
