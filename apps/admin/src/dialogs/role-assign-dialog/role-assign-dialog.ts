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
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserStore } from '../../stores/user.store';

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
    MatSelectModule,
    MatFormFieldModule,
    MatTooltipModule,
  ],
})
export default class RoleAssignDialog {
  private dialogRef = inject(MatDialogRef<RoleAssignDialog>);
  private userStore = inject(UserStore);

  selectedRoles = signal<Set<number>>(new Set());
  selectedCategory = signal<string>('all');
  selectedPermission = signal<string>('all');

  availableRoles = computed(() => this.userStore.rolesResource.value() || []);
  loading = computed(() => this.userStore.rolesResource.isLoading());

  // Role kategorilerini ayır
  roleCategories = computed(() => {
    const roles = this.availableRoles();
    const categories = new Set<string>();

    roles.forEach((role) => {
      if (role.name.includes('.')) {
        const category = role.name.split('.')[0];
        categories.add(category);
      } else {
        categories.add('System');
      }
    });

    return Array.from(categories).sort();
  });

  // Seçili kategoriye göre permissions
  availablePermissions = computed(() => {
    const category = this.selectedCategory();
    if (category === 'all') return [];

    const roles = this.availableRoles();
    const permissions = new Set<string>();

    roles.forEach((role) => {
      if (category === 'System' && !role.name.includes('.')) {
        permissions.add(role.name);
      } else if (role.name.startsWith(category + '.')) {
        const permission = role.name.split('.')[1];
        if (permission) {
          permissions.add(permission);
        }
      }
    });

    return Array.from(permissions).sort();
  });

  // Filtrelenmiş roller
  filteredRoles = computed(() => {
    const roles = this.availableRoles();
    const category = this.selectedCategory();
    const permission = this.selectedPermission();

    if (category === 'all') {
      return roles;
    }

    let filtered = roles;

    if (category === 'System') {
      filtered = roles.filter((role) => !role.name.includes('.'));
    } else {
      filtered = roles.filter((role) => role.name.startsWith(category + '.'));
    }

    if (permission !== 'all') {
      if (category === 'System') {
        filtered = filtered.filter((role) => role.name === permission);
      } else {
        filtered = filtered.filter(
          (role) => role.name === `${category}.${permission}`
        );
      }
    }

    return filtered;
  });

  rolesToAdd = computed(() => {
    const currentRoleIds = new Set(
      this.data.user.operationClaims.map((r) => r.id)
    );
    const selected = this.selectedRoles();
    return Array.from(selected).filter((roleId) => !currentRoleIds.has(roleId));
  });

  rolesToRemove = computed(() => {
    const currentRoleIds = new Set(
      this.data.user.operationClaims.map((r) => r.id)
    );
    const selected = this.selectedRoles();
    return Array.from(currentRoleIds).filter((roleId) => !selected.has(roleId));
  });

  hasChanges = computed(() => {
    return this.rolesToAdd().length > 0 || this.rolesToRemove().length > 0;
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    const currentRoleIds = this.data.user.operationClaims.map((r) => r.id);
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

  onCategoryChange(category: string) {
    this.selectedCategory.set(category);
    this.selectedPermission.set('all');
  }

  onPermissionChange(permission: string) {
    this.selectedPermission.set(permission);
  }

  getRoleDescription(roleName: string): string {
    const descriptions: Record<string, string> = {
      Admin: 'Tam yönetici yetkisi',
      'Auth.Admin': 'Kimlik doğrulama yöneticisi',
      'Auth.Read': 'Kimlik doğrulama okuma',
      'Auth.Write': 'Kimlik doğrulama yazma',
      'Auth.RevokeToken': 'Token iptal etme',
      'OperationClaims.Admin': 'Rol yönetimi admin',
      'OperationClaims.Read': 'Rolleri görüntüleme',
      'OperationClaims.Write': 'Rol ekleme/düzenleme',
      'Users.Read': 'Kullanıcıları görüntüleme',
      'Users.Write': 'Kullanıcı ekleme/düzenleme',
      'Orders.Read': 'Siparişleri görüntüleme',
      'Orders.Write': 'Sipariş oluşturma/düzenleme',
    };
    return descriptions[roleName] || 'Rol açıklaması mevcut değil';
  }

  getRoleName(roleId: number): string {
    const role = this.availableRoles().find((r) => r.id === roleId);
    return role?.name || '';
  }

  save() {
    if (this.hasChanges()) {
      this.dialogRef.close({
        rolesToAdd: this.rolesToAdd(),
        rolesToRemove: this.rolesToRemove(),
        userId: this.data.user.id,
      });
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
