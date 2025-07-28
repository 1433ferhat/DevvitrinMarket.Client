import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserModel } from '@shared/models/user.model';
import { OperationClaimStore } from '@shared/stores/operation-claim.store';
import { UserOperationClaimModel } from '@shared/models/user-operation-claim.model';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: {
    expirationDate: string;
    token: string;
  };
  requiredAuthenticatorType: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private operationClaimStore = inject(OperationClaimStore);

  // Login işlemi
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('api/auth/login', credentials).pipe(
      tap((response) => {
        // Token'ı kaydet
        this.setToken(response.accessToken.token);

        // User bilgisini parse et ve Common'a set et
        const userInfo = this.parseUserFromToken(response.accessToken.token);
        if (userInfo) {
          this.operationClaimStore.setUser(userInfo);
        }
      })
    );
  }

  // Logout işlemi
  logout(): void {
    this.clearToken();
    this.operationClaimStore.clearUser();
    this.router.navigateByUrl('/login');
  }

  // Token kaydet
  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Token sil
  private clearToken(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('response');
  }

  // Token al
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Token var mı kontrol et
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Token'ın süresi dolmuş mu kontrol et (opsiyonel)
    try {
      const decoded = this.decodeJWT(token);
      const now = Math.floor(Date.now() / 1000);
      return decoded && decoded.exp > now;
    } catch {
      return false;
    }
  }

  // JWT decode et
  private decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('JWT decode hatası:', error);
      return null;
    }
  }

  parseUserFromToken(token?: string): UserModel | undefined {
    const tokenToUse = token || this.getToken();
    if (!tokenToUse) return undefined;

    const decoded = this.decodeJWT(tokenToUse);
    if (!decoded) return undefined;

    const userOperationClaims: UserOperationClaimModel[] = [];

    const roles =
      decoded.role ||
      decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      [];

    if (Array.isArray(roles)) {
      roles.forEach((roleName: string) => {
        userOperationClaims.push({
          id: '', // backend id'si bilinmediği için boş
          userId:
            decoded.id ||
            decoded[
              'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
            ] ||
            '',
          operationClaimId: 0,
          
        });
      });
    } else if (typeof roles === 'string') {
      userOperationClaims.push({
        id: '',
        userId:
          decoded.id ||
          decoded[
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
          ] ||
          '',
        operationClaimId: 0,
      });
    }

    const user: UserModel = {
      id:
        decoded.id ||
        decoded[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
        ] ||
        '',
      name:
        decoded.name ||
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
        '',
      firstName: decoded.firstName || decoded.given_name || '',
      lastName: decoded.lastName || decoded.family_name || '',
      email:
        decoded.email ||
        decoded[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
        ] ||
        '',
      userOperationClaims: userOperationClaims,
      status: 'active',
    };

    return user;
  }

  // Uygulama başlarken varsa token'dan user'ı yükle
  initializeUserFromToken(): void {
    if (this.isAuthenticated()) {
      const userInfo = this.parseUserFromToken();
      if (userInfo) {
        this.operationClaimStore.setUser(userInfo);
      } else {
        // Token geçersiz, temizle
        this.logout();
      }
    }
  }
}
