import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomerModel } from '@shared/models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerCreateForm {
  createForm(data: Partial<CustomerModel> = {}): FormGroup {
    const group: Record<string, FormControl> = {};
    const keys = [
      'firstName',
      'lastName',
      'phone',
      'email',
      'type',
      'tcNo',
      'companyName',
      'taxNumber',
      'isCorporate',
      'isEInvoice',
    ] as const;

    for (const key of keys) {
        group[key] = new FormControl(data[key] ?? null);
    }

    // Zorunlu alanlar için validator'ları ekle
    group['firstName'].addValidators(Validators.required);
    group['lastName'].addValidators(Validators.required);
    group['phone'].addValidators(Validators.required);
    group['email'].addValidators([Validators.required, Validators.email]);
    group['type'].addValidators(Validators.required); // Bu eksikti
    group['isCorporate'].addValidators(Validators.required); // Bu da eklenebilir

    return new FormGroup(group);
  }

  isFormValidCustom(data: CustomerModel): boolean {
    if (!data) return false;

    // Eğer kurumsal müşteri ise
    if (data.isCorporate) {
      if (!data.companyName) return false;

      if (data.isEInvoice) {
        if (!data.taxNumber || data.taxNumber.toString().length !== 10) {
          return false;
        }
      }
    }
    
    if (!data.isCorporate || (data.isCorporate && !data.isEInvoice))
      if (!data.tcNo || data.tcNo.toString().length !== 11) {
        return false;
      }

    return true;
  }
}
