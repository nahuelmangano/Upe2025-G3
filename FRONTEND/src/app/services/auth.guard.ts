import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  const returnUrl = state.url && state.url !== '/login' ? state.url : undefined;
  return router.createUrlTree(['/login'], returnUrl ? { queryParams: { returnUrl } } : undefined);
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated() && auth.isAdmin()) {
    return true;
  }
  return auth.isAuthenticated() ? router.createUrlTree(['/pacientes']) : router.createUrlTree(['/login']);
};

export const nonAdminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) {
    const returnUrl = state.url && state.url !== '/login' ? state.url : undefined;
    return router.createUrlTree(['/login'], returnUrl ? { queryParams: { returnUrl } } : undefined);
  }
  if (!auth.isAdmin()) {
    return true;
  }
  return router.createUrlTree(['/admin/usuarios']);
};

export const nonRecepcionistaGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) {
    const returnUrl = state.url && state.url !== '/login' ? state.url : undefined;
    return router.createUrlTree(['/login'], returnUrl ? { queryParams: { returnUrl } } : undefined);
  }
  if (!auth.isRecepcionista()) {
    return true;
  }
  return router.createUrlTree(['/pacientes']);
};
