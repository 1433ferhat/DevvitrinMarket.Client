import { Route } from '@angular/router';
import { adminGuard, authGuard } from './guard/auth-guard';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login'),
  },
  {
    path: '',
    loadComponent: () => import('./pages/layout/layout'),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: '/users',
        pathMatch: 'full',
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users'),
        title: 'Kullanıcı Yönetimi - Admin Panel',
      },
      {
        path: 'roles',
        loadComponent: () => import('./pages/roles/roles'),
        title: 'Rol Yönetimi - Admin Panel',
      },
    ],
  },
];
