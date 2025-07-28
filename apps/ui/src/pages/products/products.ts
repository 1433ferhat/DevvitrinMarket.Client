import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ProductStore } from '@shared/stores/product.store';
import { FlexiGridModule } from 'flexi-grid';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { ProductBarcodeModel } from '@shared/models/product-barcode.model';

@Component({
  selector: 'app-products',
  templateUrl: './products.html',
  styleUrl: './products.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    FlexiGridModule,
    CommonModule,
    MatCardModule,
    MatIconModule,
    AgGridAngular,
  ],
})
export default class products {
  readonly productStore = inject(ProductStore);

  readonly products = computed(() => this.productStore.products());
  readonly loading = computed(() => this.productStore.loading());

  gridApi: GridApi | undefined = undefined;
  getDisplayedRowCount: number = 0;
  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.updateRowCount();
  }

  updateRowCount() {}
  localeText = {
    totalRows: 'Satır: {rowCount}',
  };
  columnDefs: ColDef[] = [
    {
      field: 'name',
      headerName: 'Ürün Adı',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
    },
    {
      field: 'code',
      headerName: 'Kod',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
    },
    {
      field: 'category.name',
      headerName: 'Kategori',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
    },
     {
      field: 'barcodes',
      headerName: 'Barkod',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      valueGetter: (params) => {
        const barcodes: ProductBarcodeModel[] = params.data.barcodes;
        return barcodes?.map((b) => b.value).join(', ') || '';
      },
    },
  ];

  defaultColDef: ColDef = {
    flex: 1,
    sortable: true,
    filter: true,
    resizable: true,
  };
}
