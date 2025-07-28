import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

import { OperationClaimStore } from '@shared/stores/operation-claim.store';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const operationClaimStore = inject(OperationClaimStore);
  const router = inject(Router);

  // Token ve authentication kontrolü
  if (!authService.isAuthenticated()) {
    router.navigateByUrl('/login');
    return false;
  }

  // User bilgisi signal'da yoksa token'dan yükle
  if (!operationClaimStore.user()) {
    const userInfo = authService.parseUserFromToken();
    if (userInfo) {
      operationClaimStore.setUser(userInfo);
    } else {
      // Token var ama geçersiz, logout yap
      authService.logout();
      return false;
    }
  }
  return true;
};

// Admin sayfaları için özel guard
export const adminGuard: CanActivateFn = (route, state) => {
  const operationClaimStore = inject(OperationClaimStore);
  const router = inject(Router);

  // Önce authentication kontrolü
  const authResult = authGuard(route, state);
  if (!authResult) return false;

  // Admin kontrolü
  if (!operationClaimStore.isAdmin()) {
    router.navigateByUrl('/dashboard');
    return false;
  }

  return true;
};