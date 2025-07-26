import { Injectable, signal, computed } from '@angular/core';
import { UserModel } from '@shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class Common {
  readonly user = signal<UserModel | undefined>(undefined);
  
  readonly isLoggedIn = computed(() => !!this.user());
  readonly currentUserName = computed(() => this.user()?.name || '');
  readonly currentUserEmail = computed(() => this.user()?.email || '');

  setUser(user: UserModel): void {
    this.user.set(user);
  }

  clearUser(): void {
    this.user.set(undefined);
  }

  getCurrentUser(): UserModel | undefined {
    return this.user();
  }

  hasRole(role: string): boolean {
    const currentUser = this.user();
    if (!currentUser) return false;

    return currentUser.operationClaims.some((claim) => claim.name === role);
  }

  isAdmin(): boolean {
    return this.hasRole('Admin') || this.hasRole('Auth.Admin');
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  hasAllRoles(roles: string[]): boolean {
    return roles.every((role) => this.hasRole(role));
  }

  getUserRoles(): string[] {
    const currentUser = this.user();
    if (!currentUser) return [];

    return currentUser.operationClaims.map((claim) => claim.name);
  }

  getFullName(): string {
    const currentUser = this.user();
    if (!currentUser) return '';

    if (currentUser.firstName && currentUser.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`;
    }

    return currentUser.name || '';
  }

  getUserInitials(): string {
    const currentUser = this.user();
    if (!currentUser) return '';

    if (currentUser.firstName && currentUser.lastName) {
      return `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`.toUpperCase();
    }

    if (currentUser.name) {
      const nameParts = currentUser.name.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
      }
      return currentUser.name.charAt(0).toUpperCase();
    }

    return '';
  }
}