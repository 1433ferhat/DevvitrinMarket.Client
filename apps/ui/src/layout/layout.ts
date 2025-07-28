// src/app/layout/layout.ts - Corrected version
import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  signal,
  computed,
  inject,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import Sidebar from '../components/sidebar/sidebar';
import OrderPanel from '../components/order-panel/order-panel';
import Header from './header/header';
import { ProductStore } from '@shared/stores/product.store';
import { OrderStore } from '@shared/stores/order.store';
import { CategoryStore } from '@shared/stores/category.store';
import { CustomerStore } from '@shared/stores/customer.store';
import { CustomerModel } from '@shared/models/customer.model';
import { Common } from '../services/common';
import { OperationClaimStore } from '@shared/stores/operation-claim.store';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    Header,
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatSidenavModule,
    Sidebar,
    OrderPanel,
  ],
})
export default class Layout {
  onSidebarToggle() {
    this.sidebarOpen.update((open) => !open);
  }

  private productStore = inject(ProductStore);
  private orderStore = inject(OrderStore);
  private customerStore = inject(CustomerStore);
  private categoryStore = inject(CategoryStore);
  private operationClaimStore = inject(OperationClaimStore);

  isUserLoggedIn = computed(() => this.operationClaimStore.isLoggedIn());

  sidebarOpen = signal(true);
  selectedCustomer = signal<CustomerModel | null>(null);

  products = computed(() => this.productStore.products());
  categories = computed(() => this.categoryStore.categories());

  orders = computed(() => this.orderStore.orders());
  currentOrder = computed(() => this.orderStore.currentOrder());

  isLoading = computed(
    () =>
      this.productStore.loading() ||
      this.orderStore.loading() ||
      this.categoryStore.loading() ||
      this.customerStore.loading()
  );

  constructor() {
    this.productStore.productsResource.reload();
    this.categoryStore.categoriesResource.reload();
    this.orderStore.ordersResource.reload();
    this.customerStore.customersResource.reload();
  }
}
