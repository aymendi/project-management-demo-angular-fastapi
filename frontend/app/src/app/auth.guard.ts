import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthTokenService } from './auth-token.service';

export const authGuard: CanActivateFn = () => {
  const tokenService = inject(AuthTokenService);
  const router = inject(Router);

  if (tokenService.isLoggedIn()) return true;

  router.navigateByUrl('/login');
  return false;
};
