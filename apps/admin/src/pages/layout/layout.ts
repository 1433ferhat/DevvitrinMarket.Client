import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../services/auth.service';
import { Common } from '../../services/common';
import { OperationClaimStore } from '@shared/stores/operation-claim.store';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatListModule,
  ],
})
export default class Layout {
  private authService = inject(AuthService);
  private operationClaimStore = inject(OperationClaimStore);

  sidebarOpen = signal(true);
  
  readonly currentUser = computed(() => this.operationClaimStore.user());
  readonly currentUserName = computed(() => this.operationClaimStore.getFullName() || 'Admin');
  readonly currentUserInitials = computed(() => this.operationClaimStore.getUserInitials());

  menuItems = [
    {
      title: 'Kullanıcılar',
      icon: 'people',
      route: '/users',
      permission: 'users.read'
    },
    {
      title: 'Roller',
      icon: 'security',
      route: '/roles',
      permission: 'roles.read'
    }
  ];

  filteredMenuItems = computed(() => {
    return this.menuItems.filter(item => this.hasPermission(item.permission));
  });

  toggleSidebar() {
    this.sidebarOpen.update(open => !open);
  }

  logout() {
    this.authService.logout();
  }

  hasPermission(permission: string): boolean {
    return this.operationClaimStore.hasRole(1) || this.operationClaimStore.hasRoleWithName(permission);
  }
}