import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { extractApiErrorMessage } from '../models/api.models';
import {
  AuthUser,
  LoginRequest,
  LoginResponse,
} from "../models/auth.models";
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { AuthState } from '../models/AuthState.model';



@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly storageKey = 'signal-velocity.session';
  private restorePromise: Promise<void> | null = null;
  private readonly state = signal<AuthState>({
    token: null,
    expiresAt: null,
    user: null,
    loading: false,
    initialized: false,
    error: null
  });

  readonly token = computed(() => this.state().token);
  readonly expiresAt = computed(() => this.state().expiresAt);
  readonly user = computed(() => this.state().user);
  readonly loading = computed(() => this.state().loading);
  readonly initialized = computed(() => this.state().initialized);
  readonly error = computed(() => this.state().error);
  readonly isAuthenticated = computed(() => Boolean(this.state().token));

  constructor() {
    const persistedSession = this.readPersistedSession();

    if (!persistedSession) {
      this.state.update((state) => ({ ...state, initialized: true }));
      return;
    }

    if (this.isExpired(persistedSession.expiresAt)) {
      this.clearSession(false);
      this.state.update((state) => ({ ...state, initialized: true }));
      return;
    }

    this.state.set({
      token: persistedSession.token,
      expiresAt: persistedSession.expiresAt,
      user: persistedSession.user,
      loading: false,
      initialized: false,
      error: null
    });

    this.restorePromise = this.refreshCurrentUser(false).finally(() => {
      this.state.update((state) => ({ ...state, initialized: true }));
      this.restorePromise = null;
    });
  }

  async login(credentials: LoginRequest): Promise<void> {
    this.state.update((state) => ({ ...state, loading: true, error: null }));

    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(`${this.apiBaseUrl}/auth/login`, credentials)
      );
      this.persistSession(response.accessToken, response.user, response.expiresAt);
      this.state.set({
        token: response.accessToken,
        expiresAt: response.expiresAt,
        user: response.user,
        loading: false,
        initialized: true,
        error: null
      });
    } catch (error) {
      this.clearSession(false);
      this.state.update((state) => ({
        ...state,
        loading: false,
        initialized: true,
        error: extractApiErrorMessage(error, 'Connexion impossible. Verifiez vos identifiants.')
      }));
      throw error;
    }
  }

  async refreshCurrentUser(redirectOnFailure = true): Promise<void> {
    if (!this.token()) {
      return;
    }

    if (this.isExpired(this.expiresAt())) {
      if (redirectOnFailure) {
        await this.handleUnauthorized();
      } else {
        this.clearSession(false);
      }
      return;
    }

    try {
      const user = await firstValueFrom(this.http.get<AuthUser>(`${this.apiBaseUrl}/auth/me`));
      this.persistSession(this.token(), user, this.expiresAt());
      this.state.update((state) => ({ ...state, user, error: null }));
    } catch {
      if (redirectOnFailure) {
        await this.handleUnauthorized();
      } else {
        this.clearSession(false);
      }
    }
  }

  async logout(): Promise<void> {
    this.clearSession(true);
    await this.router.navigateByUrl('/auth/login');
  }

  async ensureAuthenticated(targetUrl: string): Promise<boolean | UrlTree> {
    await this.waitForInitialization();

    if (this.token() && !this.isExpired(this.expiresAt())) {
      return true;
    }

    this.clearSession(true);
    return this.router.createUrlTree(['/auth/login'], {
      queryParams: { redirectTo: targetUrl }
    });
  }

  async waitForInitialization(): Promise<void> {
    if (this.restorePromise) {
      await this.restorePromise;
    }

    if (!this.initialized()) {
      this.state.update((state) => ({ ...state, initialized: true }));
    }
  }

  async handleUnauthorized(redirectTo?: string): Promise<void> {
    const targetUrl = redirectTo ?? this.router.url;
    this.clearSession(true);

    if (targetUrl.startsWith('/auth')) {
      await this.router.navigateByUrl('/auth/login');
      return;
    }

    await this.router.navigate(['/auth/login'], {
      queryParams: targetUrl ? { redirectTo: targetUrl } : undefined
    });
  }

  clearError(): void {
    this.state.update((state) => ({ ...state, error: null }));
  }

  private persistSession(token: string | null, user: AuthUser | null, expiresAt: string | null): void {
    if (!token || !user || !expiresAt) {
      globalThis.localStorage?.removeItem(this.storageKey);
      return;
    }

    globalThis.localStorage?.setItem(
      this.storageKey,
      JSON.stringify({
        token,
        expiresAt,
        user
      })
    );
  }

  private readPersistedSession(): { token: string; expiresAt: string; user: AuthUser } | null {
    const rawValue = globalThis.localStorage?.getItem(this.storageKey);
    if (!rawValue) {
      return null;
    }

    try {
      const parsed = JSON.parse(rawValue) as { token?: string; expiresAt?: string; user?: AuthUser };
      return parsed.token && parsed.expiresAt && parsed.user
        ? { token: parsed.token, expiresAt: parsed.expiresAt, user: parsed.user }
        : null;
    } catch {
      globalThis.localStorage?.removeItem(this.storageKey);
      return null;
    }
  }

  private clearSession(preserveInitialization: boolean): void {
    globalThis.localStorage?.removeItem(this.storageKey);
    this.state.set({
      token: null,
      expiresAt: null,
      user: null,
      loading: false,
      initialized: preserveInitialization || this.initialized(),
      error: null
    });
  }

  private isExpired(expiresAt: string | null): boolean {
    if (!expiresAt) {
      return true;
    }

    return Number.isNaN(Date.parse(expiresAt)) || Date.parse(expiresAt) <= Date.now();
  }
}
