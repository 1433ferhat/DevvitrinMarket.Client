import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Common } from '../services/common';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const common = inject(Common);
  const router = inject(Router);

  // Token ve authentication kontrolü
  if (!authService.isAuthenticated()) {
    router.navigateByUrl('/login');
    return false;
  }

  // User bilgisi signal'da yoksa token'dan yükle
  if (!common.user()) {
    const userInfo = authService.parseUserFromToken();
    if (userInfo) {
      common.setUser(userInfo);
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
  const common = inject(Common);
  const router = inject(Router);

  // Önce authentication kontrolü
  const authResult = authGuard(route, state);
  if (!authResult) return false;

  // Admin kontrolü
  if (!common.isAdmin()) {
    router.navigateByUrl('/dashboard');
    return false;
  }

  return true;
};