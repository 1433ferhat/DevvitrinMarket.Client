import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
  Inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

interface DialogData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    operationClaims: Array<{
      id: number;
      name: string;
    }>;
  };
}

@Component({
  selector: 'app-role-details-dialog',
  templateUrl: './role-details-dialog.html',
  styleUrl: './role-details-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
  ],
})
export default class RoleDetailsDialog {
  private dialogRef = inject(MatDialogRef<RoleDetailsDialog>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  getUserInitials(): string {
    return `${this.data.user.firstName.charAt(0)}${this.data.user.lastName.charAt(0)}`.toUpperCase();
  }

  getRoleColor(roleName: string): string {
    const colorMap: Record<string, string> = {
      'Admin': 'warn',
      'Users.Read': 'primary',
      'Users.Write': 'accent',
      'Orders.Read': 'primary',
      'Orders.Write': 'accent',
    };
    return colorMap[roleName] || '';
  }

  getRoleIcon(roleName: string): string {
    const iconMap: Record<string, string> = {
      'Admin': 'admin_panel_settings',
      'Users.Read': 'visibility',
      'Users.Write': 'edit',
      'Orders.Read': 'visibility',
      'Orders.Write': 'edit',
    };
    return iconMap[roleName] || 'security';
  }

  assignRoles() {
    this.dialogRef.close({ action: 'assign', userId: this.data.user.id });
  }

  close() {
    this.dialogRef.close();
  }
}