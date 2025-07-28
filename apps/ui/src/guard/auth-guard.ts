import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Common } from '../services/common';
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

  // Route seviyesinde rol kontrolü (opsiyonel)
  let hasRequiredRole = false;
  const requiredRoles = route.data?.['roles'] as string[];
  if (requiredRoles && requiredRoles.length > 0) {
    for (const el of requiredRoles) {
      if (operationClaimStore.hasRoleWithName(el)) {
        hasRequiredRole = true;
        break;
      }
    }
    if (!hasRequiredRole) {
      router.navigateByUrl('/dashboard');
      return false;
    }
  }

  return true;
};

// // Admin sayfaları için özel guard
// export const adminGuard: CanActivateFn = (route, state) => {
//   const common = inject(Common);
//   const router = inject(Router);

//   // Önce authentication kontrolü
//   const authResult = authGuard(route, state);
//   if (!authResult) return false;

//   // Admin kontrolü
//   if (!operationClaimStore.isAdmin()) {
//     router.navigateByUrl('/dashboard');
//     return false;
//   }

//   return true;
// };

// // Belirli roller için guard factory
// export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
//   return (route, state) => {
//     const operationClaimStore = inject(OperationClaimStore);
//     const router = inject(Router);

//     // Önce authentication kontrolü
//     const authResult = authGuard(route, state);
//     if (!authResult) return false;

//     // Rol kontrolü
//     let hasPermission = false;

//     for (const el of allowedRoles) {
//       if (operationClaimStore.hasRoleWithName(el)) {
//         hasPermission = true;
//         break;
//       }
//     }
//     if (!hasPermission) {
//       router.navigateByUrl('/dashboard');
//       return false;
//     }

//     return true;
//   };
// };

// // Yetki kontrolü guard (belirli sayfalar için)
// export const permissionGuard = (
//   requiredPermissions: string[]
// ): CanActivateFn => {
//   return (route, state) => {
//     const operationClaimStore = inject(OperationClaimStore);
//     const router = inject(Router);

//     // Önce authentication kontrolü
//     const authResult = authGuard(route, state);
//     if (!authResult) return false;

//     // Permission kontrolü (role ile aynı mantık)
//     let hasPermission = false;
//     for (const el of requiredPermissions) {
//       if (operationClaimStore.hasRoleWithName(el)) {
//         hasPermission = true;
//         break;
//       }
//     }
//     if (!hasPermission) {
//       // Yetki yoksa 403 sayfasına veya dashboard'a yönlendir
//       router.navigateByUrl('/dashboard');
//       return false;
//     }

//     return true;
//   };
// };
