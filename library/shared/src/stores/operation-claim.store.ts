import { Injectable, signal, computed, inject, resource } from '@angular/core';
import { UserModel } from '../models/user.model';
import { OperationClaimModel } from '../models/operation-claims.model';
import { httpResource } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class OperationClaimStore {
      readonly user = signal<UserModel | undefined>(undefined);

  readonly rolesResource = httpResource<OperationClaimModel[]>(
    () => 'api/operationclaims/getall'
  );

  readonly roles = computed(() => this.rolesResource.value() || []);

  readonly isLoggedIn = computed(() => !!this.user());
  readonly currentUserName = computed(() => this.user()?.name || '');
  readonly currentUserEmail = computed(() => this.user()?.email || '');

  hasRole(roleId?: number): boolean {
    const currentUser = this.user();
    if (!currentUser || !roleId) return false;

    return currentUser.userOperationClaims.some(
      (claim) => claim.operationClaimId === roleId
    );
  }
  hasRoleWithName(name: string): boolean {
    const currentUser = this.user();
    if (!currentUser) return false;
    const role = this.roles().find((r) => r.name === name);
    return this.hasRole(role?.id);
  }
  isAdmin(): boolean {
    return this.hasRole(1);
  }

  getUserRoles(): string[] {
    const currentUser = this.user();
    if (!currentUser) return [];

    return this.roles()
      .filter((r) => this.hasRole(r.id))
      .map((r) => r.name);
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
      return `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(
        0
      )}`.toUpperCase();
    }

    if (currentUser.name) {
      const nameParts = currentUser.name.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[1].charAt(
          0
        )}`.toUpperCase();
      }
      return currentUser.name.charAt(0).toUpperCase();
    }

    return '';
  }
  setUser(user: UserModel): void {
    this.user.set(user);
  }

  clearUser(): void {
    this.user.set(undefined);
  }

}