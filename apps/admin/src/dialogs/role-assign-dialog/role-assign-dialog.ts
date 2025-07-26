import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
  Inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface DialogData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    operationClaims: Array<{
      id: number;
      name: string;
    }>;
  };
  availableRoles: Array<{
    id: number;
    name: string;
  }>;
}

@Component({
  selector: 'app-role-assign-dialog',
  templateUrl: './role-assign-dialog.html',
  styleUrl: './role-assign-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
})
export default class RoleAssignDialog {
  private dialogRef = inject(MatDialogRef<RoleAssignDialog>);

  loading = signal(false);
  selectedRoles = signal<Set<number>>(new Set());

  rolesToAdd = computed(() => {
    const currentRoleIds = new Set(this.data.user.operationClaims.map(r => r.id));
    const selected = this.selectedRoles();
    return Array.from(selected).filter(roleId => !currentRoleIds.has(roleId));
  });

  rolesToRemove = computed(() => {
    const currentRoleIds = new Set(this.data.user.operationClaims.map(r => r.id));
    const selected = this.selectedRoles();
    return Array.from(currentRoleIds).filter(roleId => !selected.has(roleId));
  });

  hasChanges = computed(() => {
    return this.rolesToAdd().length > 0 || this.rolesToRemove().length > 0;
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    const currentRoleIds = this.data.user.operationClaims.map(r => r.id);
    this.selectedRoles.set(new Set(currentRoleIds));
  }

  isRoleAssigned(roleId: number): boolean {
    return this.selectedRoles().has(roleId);
  }

  toggleRole(roleId: number, checked: boolean) {
    const current = new Set(this.selectedRoles());
    if (checked) {
      current.add(roleId);
    } else {
      current.delete(roleId);
    }
    this.selectedRoles.set(current);
  }

  getRoleDescription(roleName: string): string {
    const descriptions: Record<string, string> = {
      'Admin': 'Tam yönetici yetkisi',
      'Users.Read': 'Kullanıcıları görüntüleme',
      'Users.Write': 'Kullanıcı ekleme/düzenleme',
      'Orders.Read': 'Siparişleri görüntüleme',
      'Orders.Write': 'Sipariş oluşturma/düzenleme',
    };
    return descriptions[roleName] || 'Rol açıklaması mevcut değil';
  }

  getRoleName(roleId: number): string {
    const role = this.data.availableRoles.find(r => r.id === roleId);
    return role?.name || '';
  }

  save() {
    if (this.hasChanges()) {
      this.dialogRef.close({
        rolesToAdd: this.rolesToAdd(),
        rolesToRemove: this.rolesToRemove(),
        userId: this.data.user.id
      });
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}