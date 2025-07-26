import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  signal,
  computed,
  inject,
  resource,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import UserCreateDialog from '../../dialogs/user-create-dialog/user-create-dialog';
import RoleDetailsDialog from '../../dialogs/role-details-dialog/role-details-dialog';
import RoleAssignDialog from '../../dialogs/role-assign-dialog/role-assign-dialog';
import { UserStore } from '../../stores/user.store';
import { UserModel } from '@shared/models/user.model';

@Component({
  selector: 'app-users',
  templateUrl: './users.html',
  styleUrl: './users.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    AgGridAngular,
  ],
})
export default class Users {
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private userStore = inject(UserStore);

  readonly users = computed<UserModel[]>(() => this.userStore.users());
  readonly loading = computed<boolean>(
    () =>
      this.userStore.rolesResource.isLoading() ||
      this.userStore.usersResource.isLoading()
  );

  private gridApi!: GridApi;

  columnDefs: ColDef[] = [
    {
      headerName: 'Ad Soyad',
      field: 'fullName',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      flex: 2,
      valueGetter: (params) =>
        `${params.data.firstName} ${params.data.lastName}`,
    },
    {
      headerName: 'E-posta',
      field: 'email',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      flex: 2,
    },
    {
      headerName: 'Roller',
      field: 'roles',
      flex: 2,
      cellRenderer: (params: any) => {
        const roles = params.data.operationClaims || [];
        if (roles.length === 0)
          return '<span style="color: #999;">Rol yok</span>';

        const roleNames = roles.map((role: any) => role.name).join(', ');
        return `<span style="color: #2196f3; cursor: pointer;" onclick="window.showRoleDetails('${params.data.id}')">${roleNames}</span>`;
      },
    },
    {
      headerName: 'İşlemler',
      field: 'actions',
      width: 150,
      cellRenderer: (params: any) => {
        return `
          <div style="display: flex; gap: 8px; align-items: center; height: 100%;">
            <button onclick="window.createRoles('${params.data.id}')" 
                    style="background: #2196f3; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">
              Rol Ata
            </button>
            <button onclick="window.deleteUser('${params.data.id}')" 
                    style="background: #f44336; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">
              Sil
            </button>
          </div>
        `;
      },
    },
  ];

  defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
  };

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;

    (window as any).showRoleDetails = (userId: string) =>
      this.showRoleDetails(userId);
    (window as any).createRoles = (userId: string) => this.createRoles(userId);
    (window as any).deleteUser = (userId: string) => this.deleteUser(userId);
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(UserCreateDialog, {
      width: '500px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.createUser(result);
      }
    });
  }

  async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    try {
      await lastValueFrom(this.http.post('api/auth/register', userData));
      this.userStore.usersResource.reload();
      this.snackBar.open('Kullanıcı başarıyla oluşturuldu', 'Tamam', {
        duration: 3000,
      });
    } catch (error) {
      this.snackBar.open('Kullanıcı oluşturulurken hata oluştu', 'Tamam', {
        duration: 3000,
      });
    }
  }

  async deleteUser(userId: string) {
    const user = this.users().find((u) => u.id === userId);
    if (!user) return;

    if (
      confirm(
        `${user.firstName} ${user.lastName} kullanıcısını silmek istediğinizden emin misiniz?`
      )
    ) {
      try {
        await lastValueFrom(this.http.delete(`api/users/${userId}`));
        this.userStore.usersResource.reload();
        this.snackBar.open('Kullanıcı başarıyla silindi', 'Tamam', {
          duration: 3000,
        });
      } catch (error) {
        this.snackBar.open('Kullanıcı silinirken hata oluştu', 'Tamam', {
          duration: 3000,
        });
      }
    }
  }

  showRoleDetails(userId: string) {
    const user = this.users().find((u) => u.id === userId);
    if (!user) return;

    const dialogRef = this.dialog.open(RoleDetailsDialog, {
      width: '600px',
      data: { user },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'assign') {
        this.createRoles(result.userId);
      }
    });
  }

  createRoles(userId: string) {
    const user = this.users().find((u) => u.id === userId);
    if (!user) return;

    const dialogRef = this.dialog.open(RoleAssignDialog, {
      width: '95vw',
      height: '90vh',
      maxWidth: '1400px',
      maxHeight: '90vh',
      disableClose: true,
      data: { user },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.saveRoleChanges(result);
      }
    });
  }

  async saveRoleChanges(data: {
    userId: string;
    rolesToAdd: number[];
    rolesToRemove: number[];
  }) {
    try {
      // Add roles
      for (const roleId of data.rolesToAdd) {
        await lastValueFrom(
          this.http.post('api/userOperationClaims', {
            userId: data.userId,
            operationClaimId: roleId,
          })
        );
      }

      // Remove roles
      for (const roleId of data.rolesToRemove) {
        // Need userOperationClaim ID for deletion - get from userOperationClaims/getAll
        const userClaims = await lastValueFrom(
          this.http.get<any[]>('api/userOperationClaims/getAll')
        );
        const userClaim = userClaims.find(
          (uc) => uc.userId === data.userId && uc.operationClaimId === roleId
        );

        if (userClaim) {
          await lastValueFrom(
            this.http.delete(`api/userOperationClaims/${userClaim.id}`)
          );
        }
      }

      this.userStore.usersResource.reload();
      this.snackBar.open('Roller başarıyla güncellendi', 'Tamam', {
        duration: 3000,
      });
    } catch (error) {
      this.snackBar.open('Roller güncellenirken hata oluştu', 'Tamam', {
        duration: 3000,
      });
    }
  }

  refresh() {
    this.userStore.usersResource.reload();
    this.userStore.rolesResource.reload();
  }
}
