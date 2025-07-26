// src/app/pages/orders/orders.ts
import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  computed,
  inject,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AgGridAngular } from 'ag-grid-angular';
import { Router } from '@angular/router';
import {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  ICellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import { OrderStore } from '@shared/stores/order.store';
import { OrderModel } from '@shared/models/order.model';
import { OrderStatus, getOrderStatusLabel } from '@shared/enums/order-status.enum';
import { PaymentMethod, getPaymentMethodLabel } from '@shared/enums/payment-method.enum';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    AgGridAngular,
  ],
})
export default class Orders implements OnDestroy {
  readonly orderStore = inject(OrderStore);
  readonly router = inject(Router);
  readonly orderStatus = OrderStatus;
  readonly paymentMethod = PaymentMethod;

  orders = computed(() => this.orderStore.orders());
  loading = computed(() => this.orderStore.loading());

  columnDefs: ColDef[] = [
    {
      field: 'documentNumber',
      headerName: 'Belge No',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
    },
    {
      field: 'orderDate',
      headerName: 'Tarih',
      filter: 'agDateColumnFilter',
      floatingFilter: true,
      valueFormatter: (params: ValueFormatterParams) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleString('tr-TR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
    {
      field: 'customer',
      headerName: 'Müşteri',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      valueGetter: (params) => {
        const customer = params.data.customer;
        if (!customer) return 'Bilinmeyen Müşteri';
        if (customer.isCorporate && customer.companyName) {
          return customer.companyName;
        }
        return `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
      },
    },
    {
      field: 'status',
      headerName: 'Durum',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      cellRenderer: (params: ICellRendererParams) => {
        return getOrderStatusLabel(params.value);
      },
    },
    {
      field: 'paymentMethod',
      headerName: 'Ödeme',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      cellRenderer: (params: ICellRendererParams) => {
        return getPaymentMethodLabel(params.value);
      },
    },
    {
      field: 'totalPrice',
      headerName: 'Toplam Tutar',
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      valueFormatter: (params: ValueFormatterParams) => {
        if (params.value == null) return '0,00 ₺';
        return new Intl.NumberFormat('tr-TR', {
          style: 'currency',
          currency: 'TRY',
          minimumFractionDigits: 2,
        }).format(params.value);
      },
    },
    {
      field: 'totalQuantity',
      headerName: 'Adet',
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
    },
    {
      headerName: 'İşlemler',
      field: 'actions',
      sortable: false,
      filter: false,
      resizable: false,
      width: 120,
      cellRenderer: (params: ICellRendererParams) => {
        const orderId = params.data.id;
        return `
          <div class="action-buttons">
            <button type="button" class="action-btn view-btn" onclick="viewOrder('${orderId}')" title="Görüntüle">
              👁️
            </button>
            <button type="button" class="action-btn edit-btn" onclick="editOrder('${orderId}')" title="Düzenle">
              ✏️
            </button>
          </div>
        `;
      },
    },
  ];

  defaultColDef: ColDef = {
    flex: 1,
    sortable: true,
    filter: true,
    resizable: true,
  };

  gridOptions: GridOptions = {
    animateRows: true,
    rowHeight: 60,
    headerHeight: 48,
    floatingFiltersHeight: 40,
    pagination: true,
    paginationPageSize: 25,
    paginationPageSizeSelector: [10, 25, 50, 100],
    localeText: {
      page: 'Sayfa',
      more: 'Daha fazla',
      to: '-',
      of: 'toplam',
      next: 'Sonraki',
      last: 'Son',
      first: 'İlk',
      previous: 'Önceki',
      loadingOoo: 'Yükleniyor...',
      selectAll: 'Tümünü Seç',
      searchOoo: 'Ara...',
      blanks: 'Boş',
      noRowsToShow: 'Gösterilecek sipariş bulunamadı',
      filterOoo: 'Filtrele...',
      equals: 'Eşittir',
      notEqual: 'Eşit değildir',
      lessThan: 'Küçüktür',
      greaterThan: 'Büyüktür',
      contains: 'İçerir',
      startsWith: 'İle başlar',
      endsWith: 'İle biter',
    },
  };

  onGridReady(params: GridReadyEvent) {
    (window as any).viewOrder = (orderId: string) => this.viewOrder(orderId);
    (window as any).editOrder = (orderId: string) => this.editOrder(orderId);
  }

  ngOnDestroy() {
    delete (window as any).viewOrder;
    delete (window as any).editOrder;
  }

  viewOrder(orderId: string) {
    this.router.navigate(['/orders', orderId]);
  }

  editOrder(orderId: string) {
    this.router.navigate(['/orders', orderId, 'edit']);
  }

  refreshGrid() {
    this.orderStore.ordersResource.reload();
  }
}