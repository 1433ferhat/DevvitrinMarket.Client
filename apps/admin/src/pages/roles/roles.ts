import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  computed,
  inject,
  resource,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import { UserStore } from '../../stores/user.store';

interface OperationClaim {
  id: number;
  name: string;
}

@Component({
  selector: 'app-roles',
  templateUrl: './roles.html',
  styleUrl: './roles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    AgGridAngular,
  ],
})
export default class Roles {
  private userStore = inject(UserStore);

  readonly roles = computed(() => this.userStore.rolesResource.value() || []);
  readonly loading = computed(() => this.userStore.rolesResource.isLoading());

  columnDefs: ColDef[] = [
    {
      headerName: 'ID',
      field: 'id',
      width: 80,
    },
    {
      headerName: 'Rol Adı',
      field: 'name',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      flex: 1,
    },
    {
      headerName: 'Açıklama',
      field: 'description',
      flex: 2,
      valueGetter: (params) => this.getRoleDescription(params.data.name),
    },
  ];

  defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
  };

  onGridReady(params: GridReadyEvent) {
    // Grid hazır
  }

  getRoleDescription(roleName: string): string {
    const descriptions: Record<string, string> = {
      Admin: 'Tam yönetici yetkisi',
      'Users.Read': 'Kullanıcıları görüntüleme',
      'Users.Write': 'Kullanıcı ekleme/düzenleme',
      'Orders.Read': 'Siparişleri görüntüleme',
      'Orders.Write': 'Sipariş oluşturma/düzenleme',
    };
    return descriptions[roleName] || '-';
  }

  refresh() {
    this.userStore.rolesResource.reload();
  }
}
