// src/app/components/barcode-scanner/barcode-scanner.ts
import {
  Component,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ProductModel } from '@shared/models/product.model';
import { ProductStore } from '@shared/stores/product.store';
import { OrderItemStore } from '@shared/stores/order-item.store';

@Component({
  selector: 'app-barcode-scanner',
  templateUrl: './barcode-scanner.html',
  styleUrl: './barcode-scanner.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
})
export default class BarcodeScanner {
  @ViewChild('barcodeInput') barcodeInput!: ElementRef<HTMLInputElement>;

  readonly #productStore = inject(ProductStore);
  readonly #orderItemStore = inject(OrderItemStore);

  barcode = signal<string>('');
  searchResults = signal<ProductModel[]>([]);

  searchProduct() {
    const barcodeValue = this.barcode().trim();
    if (!barcodeValue) return;

    const results = this.#productStore.searchProducts(barcodeValue);
    this.searchResults.set(results);

    if (results.length === 1) this.selectProduct(results[0]);
  }
  selectProduct(product: ProductModel) {
    this.barcode.set('');
    this.searchResults.set([]);
    this.barcodeInput?.nativeElement.focus();
    this.#orderItemStore.addItem(product);
  }
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.searchProduct();
  }

  getProductBrand(product: ProductModel): string {
    return product.category?.name || 'Bilinmeyen';
  }

  getFirstBarcode(product: ProductModel): string {
    return product.barcodes?.[0]?.value || '';
  }

  getProductPrice(product: ProductModel): number {
    return product.prices?.[0]?.price || 0;
  }
}
