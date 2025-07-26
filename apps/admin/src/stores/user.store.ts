import {  httpResource } from '@angular/common/http';
import { computed,  Injectable } from '@angular/core';
import { UserModel } from '@shared/models/user.model';
import { OperationClaimsModel } from '@shared/models/operation-claims.model';

@Injectable({
  providedIn: 'root',
})
export class UserStore {
  readonly usersResource = httpResource<UserModel[]>(() => 'api/users/GetAll');
  readonly rolesResource = httpResource<OperationClaimsModel[]>(
    () => 'api/operationclaims/getall'
  );

  readonly users = computed(() => this.usersResource.value() || []);
  readonly roles = computed(() => this.rolesResource.value() || []);

}
