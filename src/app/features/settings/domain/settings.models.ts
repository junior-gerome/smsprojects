export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending';
}

export interface CreatePlatformUserRequest {
  fullName: string;
  email: string;
  password: string;
  roles: string[];
}

export interface PlatformRole {
  id: string;
  name: string;
  members: number;
  permissions: string[];
}

export interface ApiKey {
  id: string;
  label: string;
  scope: string[];
  lastUsedAt: string | null;
  status: 'active' | 'rotate';
}

export interface SmsProviderStatus {
  providerId: string;
  enabled: boolean;
  mode: string;
  defaultProvider: boolean;
  fallbackProvider: boolean;
  senderId: string | null;
  senderAddress: string | null;
  authConfigured: boolean;
  sendUrlConfigured: boolean;
  credentialsConfigured: boolean;
  routedOperators: string[];
}
