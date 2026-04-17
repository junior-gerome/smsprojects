import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { extractApiErrorMessage } from '../../../core/models/api.models';
import { I18nService } from '../../../core/services/i18n.service';
import { ApiKey, CreatePlatformUserRequest, PlatformRole, PlatformUser, SmsProviderStatus } from '../domain/settings.models';
import { SettingsApiService } from '../infrastructure/settings-api.service';

interface SettingsState {
  users: PlatformUser[];
  roles: PlatformRole[];
  apiKeys: ApiKey[];
  providers: SmsProviderStatus[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  createError: string | null;
  createSuccess: string | null;
}

@Injectable()
export class SettingsFacade {
  private readonly api = inject(SettingsApiService);
  private readonly i18n = inject(I18nService);
  private readonly state = signal<SettingsState>({
    users: [],
    roles: [],
    apiKeys: [],
    providers: [],
    loading: true,
    saving: false,
    error: null,
    createError: null,
    createSuccess: null
  });

  readonly users = computed(() => this.state().users);
  readonly roles = computed(() => this.state().roles);
  readonly apiKeys = computed(() => this.state().apiKeys);
  readonly providers = computed(() => this.state().providers);
  readonly loading = computed(() => this.state().loading);
  readonly saving = computed(() => this.state().saving);
  readonly error = computed(() => this.state().error);
  readonly createError = computed(() => this.state().createError);
  readonly createSuccess = computed(() => this.state().createSuccess);
  readonly availableRoles = computed(() => ['ADMIN', 'MANAGER', 'ANALYST', 'OPERATOR']);

  constructor() {
    effect(() => {
      this.i18n.language();
      void this.load();
    }, { allowSignalWrites: true });
  }

  async load(): Promise<void> {
    this.state.update((state) => ({ ...state, loading: true, error: null }));

    try {
      const [users, apiKeys, providers] = await Promise.all([
        this.api.getUsers(),
        this.api.getApiKeys(),
        this.api.getSmsProviders()
      ]);
      this.state.update((state) => ({
        ...state,
        users,
        roles: this.buildRoles(users),
        apiKeys,
        providers,
        loading: false,
        error: null
      }));
    } catch (error) {
      this.state.update((state) => ({
        ...state,
        loading: false,
        error: extractApiErrorMessage(
          error,
          this.i18n.language() === 'fr'
            ? "Impossible de charger les parametres d'administration."
            : 'Unable to load administration settings.'
        )
      }));
    }
  }

  async createUser(payload: CreatePlatformUserRequest): Promise<void> {
    this.state.update((state) => ({
      ...state,
      saving: true,
      createError: null,
      createSuccess: null
    }));

    try {
      const createdUser = await this.api.createUser(payload);
      const users = [createdUser, ...this.state().users];

      this.state.update((state) => ({
        ...state,
        users,
        roles: this.buildRoles(users),
        saving: false,
        createError: null,
        createSuccess:
          this.i18n.language() === 'fr' ? 'Utilisateur cree avec succes.' : 'User created successfully.'
      }));
    } catch (error) {
      this.state.update((state) => ({
        ...state,
        saving: false,
        createError: extractApiErrorMessage(
          error,
          this.i18n.language() === 'fr' ? "Impossible de creer l'utilisateur." : 'Unable to create the user.'
        )
      }));
    }
  }

  private buildRoles(users: PlatformUser[]): PlatformRole[] {
    const roleMap = new Map<string, PlatformRole>();

    users.forEach((user) => {
      const roleName = user.role;
      const existingRole = roleMap.get(roleName);

      if (existingRole) {
        existingRole.members += 1;
        return;
      }

      roleMap.set(roleName, {
        id: roleName.toLowerCase(),
        name: roleName,
        members: 1,
        permissions: this.defaultPermissions(roleName)
      });
    });

    return [...roleMap.values()];
  }

  private defaultPermissions(role: string): string[] {
    if (role.includes('ADMIN')) {
      return ['users:write', 'campaigns:write', 'keys:rotate', 'templates:write'];
    }
    if (role.includes('MANAGER')) {
      return ['campaigns:write', 'contacts:write', 'templates:write'];
    }
    if (role.includes('ANALYST')) {
      return ['analytics:read', 'reports:export'];
    }

    return ['campaigns:read', 'contacts:read'];
  }
}
