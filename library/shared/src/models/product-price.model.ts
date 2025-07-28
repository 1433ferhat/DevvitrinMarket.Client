import { PriceType } from '../enums/price-type.enum';
import { ProductModel } from './product.model';

export interface ProductPriceModel {
  id: string;
  price: number;
  type: PriceType;
  productId: string;
  product?: ProductModel;
}

export const initialProductPrice: ProductPriceModel = {
  id: '',
  price: 0,
  type: PriceType.Undefined,
  productId: ''
};