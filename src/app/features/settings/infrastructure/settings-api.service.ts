import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import { ApiKey, CreatePlatformUserRequest, PlatformUser, SmsProviderStatus } from '../domain/settings.models';

interface UserApiResponse {
  id: string;
  fullName: string;
  email: string;
  enabled: boolean;
  roles: string[];
}

interface ApiKeyApiResponse {
  id: string;
  label: string;
  scopes: string[];
  lastUsedAt: string | null;
  status: 'ACTIVE' | 'ROTATE';
}

@Injectable({ providedIn: 'root' })
export class SettingsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  async getUsers(): Promise<PlatformUser[]> {
    const users = await firstValueFrom(this.http.get<UserApiResponse[]>(`${this.apiBaseUrl}/users`));
    return users.map((user) => this.mapUser(user));
  }

  async createUser(payload: CreatePlatformUserRequest): Promise<PlatformUser> {
    const user = await firstValueFrom(
      this.http.post<UserApiResponse>(`${this.apiBaseUrl}/users`, {
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password,
        roles: payload.roles.map((role) => `ROLE_${role}`)
      })
    );

    return this.mapUser(user);
  }

  async getApiKeys(): Promise<ApiKey[]> {
    const apiKeys = await firstValueFrom(this.http.get<ApiKeyApiResponse[]>(`${this.apiBaseUrl}/admin/api-keys`));
    return apiKeys.map((apiKey) => ({
      id: apiKey.id,
      label: apiKey.label,
      scope: apiKey.scopes,
      lastUsedAt: apiKey.lastUsedAt,
      status: apiKey.status === 'ACTIVE' ? 'active' : 'rotate'
    }));
  }

  async getSmsProviders(): Promise<SmsProviderStatus[]> {
    return firstValueFrom(this.http.get<SmsProviderStatus[]>(`${this.apiBaseUrl}/admin/sms/providers`));
  }

  private mapUser(user: UserApiResponse): PlatformUser {
    return {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.roles[0]?.replace('ROLE_', '') ?? 'OPERATOR',
      status: user.enabled ? 'active' : 'pending'
    };
  }
}
