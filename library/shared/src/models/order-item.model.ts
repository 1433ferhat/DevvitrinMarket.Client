import { ProductModel } from './product.model';

export interface OrderItemModel {
  id: string;
  productId: string;
  orderId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: ProductModel | undefined;
}
