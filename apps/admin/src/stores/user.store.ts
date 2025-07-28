import {  httpResource } from '@angular/common/http';
import { computed,  Injectable } from '@angular/core';
import { UserModel } from '@shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserStore {
  readonly usersResource = httpResource<UserModel[]>(() => 'api/users/GetAll');
  readonly users = computed(() => this.usersResource.value() || []);

}
