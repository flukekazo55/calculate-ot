import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  identity: string;
  password: string;
}

interface AuthResponse {
  message: string;
  user: AuthUser;
}

declare global {
  interface Window {
    __APP_CONFIG?: { API_BASE?: string };
  }
}

const API_BASE_STORAGE_KEY = 'otApiBase';
const USER_STORAGE_KEY = 'otAuthUser';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private readonly http: HttpClient) {}

  get currentUser(): AuthUser | null {
    return this.readStoredUser();
  }

  get isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  register(payload: RegisterRequest): Observable<AuthUser> {
    return this.http.post<AuthResponse>(this.buildApiUrl('auth/register'), payload).pipe(
      map((res) => res.user),
      tap((user) => this.persistUser(user)),
    );
  }

  login(payload: LoginRequest): Observable<AuthUser> {
    return this.http.post<AuthResponse>(this.buildApiUrl('auth/login'), payload).pipe(
      map((res) => res.user),
      tap((user) => this.persistUser(user)),
    );
  }

  logout(): void {
    this.safeStorageRemove(USER_STORAGE_KEY);
  }

  private buildApiUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    const apiBase = this.resolveApiBase();
    if (!apiBase) return `./${normalizedPath}`;
    return `${apiBase}/${normalizedPath}`;
  }

  private resolveApiBase(): string {
    const configValue = this.normalizeApiBase(window.__APP_CONFIG?.API_BASE || '');
    if (configValue) {
      this.safeStorageSet(API_BASE_STORAGE_KEY, configValue);
      return configValue;
    }

    return this.normalizeApiBase(this.safeStorageGet(API_BASE_STORAGE_KEY));
  }

  private normalizeApiBase(input: string | null | undefined): string {
    if (!input) return '';
    let value = String(input).trim();
    if (!value) return '';

    if (/^\/\//.test(value)) {
      value = `https:${value}`;
    } else if (
      !/^https?:\/\//i.test(value) &&
      /^[a-z0-9.-]+\.[a-z]{2,}(:\d+)?(\/.*)?$/i.test(value)
    ) {
      value = `https://${value}`;
    }

    return value.replace(/\/+$/, '');
  }

  private persistUser(user: AuthUser): void {
    this.safeStorageSet(USER_STORAGE_KEY, JSON.stringify(user));
  }

  private readStoredUser(): AuthUser | null {
    try {
      const raw = this.safeStorageGet(USER_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<AuthUser>;
      if (!parsed || typeof parsed !== 'object') return null;
      if (
        typeof parsed.id !== 'string' ||
        typeof parsed.username !== 'string' ||
        typeof parsed.email !== 'string' ||
        typeof parsed.createdAt !== 'string'
      ) {
        return null;
      }

      return {
        id: parsed.id,
        username: parsed.username,
        email: parsed.email,
        createdAt: parsed.createdAt,
      };
    } catch {
      return null;
    }
  }

  private safeStorageGet(key: string): string {
    try {
      return localStorage.getItem(key) || '';
    } catch {
      return '';
    }
  }

  private safeStorageSet(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {}
  }

  private safeStorageRemove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
}
