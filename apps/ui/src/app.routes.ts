import { Route } from '@angular/router';
import { authGuard } from './guard/auth-guard';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login'),
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout'),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/orders/create/order-create'),
        title: 'Satış Yap - OTC Satış',
      },
      {
        path: 'customer',
        loadComponent: () =>
          import('./components/customer-selection/customer-selection'),
        title: 'Satış Yap - OTC Satış',
      },
      {
        path: 'siparisler',
        loadChildren: () => import('./pages/orders/orders.routes'),
      },
      {
        path: 'urunler',
        title: 'Fiyat Sorgula - OTC Satış',
        loadChildren: () => import('./pages/products/products.routes'),
      },
      {
        path: 'musteriler',
        loadChildren: () => import('./pages/customer/customer.routes'),
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/orders/orders'),
        title: 'Sipariş Listesi - OTC Satış',
      },
    ],
  },
];
