import { Component, inject } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { SettingsFacade } from '../application/settings.facade';
import { UiPageHeaderComponent } from '../../../shared/ui/page-header.component';
import { ApiKeysSettingsComponent } from './components/api-keys-settings.component';
import { RolesSettingsComponent } from './components/roles-settings.component';
import { SmsProvidersSettingsComponent } from './components/sms-providers-settings.component';
import { UsersSettingsComponent } from './components/users-settings.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    UiPageHeaderComponent,
    UsersSettingsComponent,
    RolesSettingsComponent,
    ApiKeysSettingsComponent,
    SmsProvidersSettingsComponent
  ],
  providers: [SettingsFacade],
  template: `
    <div class="space-y-6">
      <ui-page-header
        [eyebrow]="i18n.language() === 'fr' ? 'Global Configuration' : 'Global Configuration'"
        [title]="i18n.t('settings.title')"
        [description]="i18n.t('settings.description')"
      >
        <div actions>
          <button type="button" class="btn-secondary" (click)="facade.load()">
            <span class="material-symbols-outlined">refresh</span>
            {{ i18n.t('settings.refresh') }}
          </button>
        </div>
      </ui-page-header>

      @if (facade.error()) {
        <div class="rounded-[1.75rem] border border-error/20 bg-error/10 px-5 py-4 text-sm text-error">
          {{ facade.error() }}
        </div>
      }

      @if (facade.loading()) {
        <section class="section-card">
          <p class="eyebrow">{{ i18n.language() === 'fr' ? 'Gouvernance' : 'Governance' }}</p>
          <h2 class="mt-2 text-lg font-bold text-on-surface">{{ i18n.t('settings.loadingTitle') }}</h2>
          <p class="mt-2 text-sm text-on-surface-variant">{{ i18n.t('settings.loadingDescription') }}</p>
        </section>
      } @else {
        <div class="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <app-users-settings
            [users]="facade.users()"
            [availableRoles]="facade.availableRoles()"
            [saving]="facade.saving()"
            [createError]="facade.createError()"
            [createSuccess]="facade.createSuccess()"
            (createUser)="facade.createUser($event)"
          />
          <app-roles-settings [roles]="facade.roles()" />
        </div>

        <app-api-keys-settings [apiKeys]="facade.apiKeys()" />
        <app-sms-providers-settings [providers]="facade.providers()" />
      }
    </div>
  `
})
export class SettingsPageComponent {
  protected readonly facade = inject(SettingsFacade);
  protected readonly i18n = inject(I18nService);
}
