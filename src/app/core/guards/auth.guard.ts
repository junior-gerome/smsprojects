import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateChildFn = async (_route, state) => {
  const authService = inject(AuthService);
  return authService.ensureAuthenticated(state.url);
};

export const guestGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  await authService.waitForInitialization();
  return authService.isAuthenticated() ? router.createUrlTree(['/dashboard']) : true;
};
