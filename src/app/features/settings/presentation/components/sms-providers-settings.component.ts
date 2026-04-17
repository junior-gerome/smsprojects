import { Component, inject, input } from '@angular/core';
import { UiStatusChipComponent } from '../../../../shared/ui/status-chip.component';
import { I18nService } from '../../../../core/services/i18n.service';
import { SmsProviderStatus } from '../../domain/settings.models';

@Component({
  selector: 'app-sms-providers-settings',
  standalone: true,
  imports: [UiStatusChipComponent],
  template: `
    <section class="section-card space-y-4">
      <div>
        <p class="eyebrow">{{ i18n.language() === 'fr' ? 'Routage operateurs' : 'Carrier routing' }}</p>
        <h2 class="mt-2 text-lg font-bold text-on-surface">{{ i18n.t('settings.providers.title') }}</h2>
        <p class="mt-2 text-sm text-on-surface-variant">{{ i18n.t('settings.providers.description') }}</p>
      </div>

      <div class="space-y-3">
        @for (provider of providers(); track provider.providerId) {
          <article class="rounded-[1.5rem] bg-surface-container-low p-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 class="text-sm font-bold tracking-[0.08em] text-on-surface">{{ provider.providerId }}</h3>
                <p class="mt-1 text-sm text-on-surface-variant">
                  {{ i18n.t('settings.providers.mode') }}: {{ modeLabel(provider.mode) }}
                  ·
                  {{ i18n.t('settings.providers.sender') }}: {{ senderLabel(provider) }}
                </p>
              </div>

              <div class="flex flex-wrap gap-2">
                <ui-status-chip [label]="provider.enabled ? enabledLabel() : disabledLabel()" [tone]="provider.enabled ? 'success' : 'danger'" />
                @if (provider.defaultProvider) {
                  <ui-status-chip [label]="i18n.language() === 'fr' ? 'defaut' : 'default'" tone="primary" [dot]="false" />
                }
                @if (provider.fallbackProvider) {
                  <ui-status-chip [label]="i18n.language() === 'fr' ? 'fallback' : 'fallback'" tone="warning" [dot]="false" />
                }
              </div>
            </div>

            <div class="mt-4 grid gap-3 md:grid-cols-3">
              <div class="rounded-2xl bg-surface-container-high px-4 py-3 text-sm text-on-surface">
                <p class="text-on-surface-variant">{{ i18n.t('settings.providers.auth') }}</p>
                <p class="mt-1 font-semibold">{{ configuredLabel(provider.authConfigured) }}</p>
              </div>
              <div class="rounded-2xl bg-surface-container-high px-4 py-3 text-sm text-on-surface">
                <p class="text-on-surface-variant">{{ i18n.t('settings.providers.sendUrl') }}</p>
                <p class="mt-1 font-semibold">{{ configuredLabel(provider.sendUrlConfigured) }}</p>
              </div>
              <div class="rounded-2xl bg-surface-container-high px-4 py-3 text-sm text-on-surface">
                <p class="text-on-surface-variant">{{ i18n.t('settings.providers.credentials') }}</p>
                <p class="mt-1 font-semibold">{{ configuredLabel(provider.credentialsConfigured) }}</p>
              </div>
            </div>

            <div class="mt-4 rounded-2xl bg-surface-container-high px-4 py-3 text-sm text-on-surface">
              <p class="text-on-surface-variant">{{ i18n.t('settings.providers.operators') }}</p>
              <p class="mt-1 font-semibold">
                {{ provider.routedOperators.length ? provider.routedOperators.join(', ') : i18n.t('settings.providers.none') }}
              </p>
            </div>
          </article>
        }
      </div>
    </section>
  `
})
export class SmsProvidersSettingsComponent {
  protected readonly i18n = inject(I18nService);
  readonly providers = input.required<SmsProviderStatus[]>();

  protected enabledLabel(): string {
    return this.i18n.language() === 'fr' ? 'active' : 'enabled';
  }

  protected disabledLabel(): string {
    return this.i18n.language() === 'fr' ? 'desactive' : 'disabled';
  }

  protected configuredLabel(configured: boolean): string {
    return configured
      ? this.i18n.language() === 'fr'
        ? 'configure'
        : 'configured'
      : this.i18n.language() === 'fr'
        ? 'manquant'
        : 'missing';
  }

  protected senderLabel(provider: SmsProviderStatus): string {
    return provider.senderId || provider.senderAddress || (this.i18n.language() === 'fr' ? 'non defini' : 'not set');
  }

  protected modeLabel(mode: string): string {
    switch (mode.toLowerCase()) {
      case 'live':
        return this.i18n.language() === 'fr' ? 'production' : 'live';
      case 'mock':
        return this.i18n.language() === 'fr' ? 'simulation' : 'mock';
      case 'sandbox':
        return this.i18n.language() === 'fr' ? 'bac a sable' : 'sandbox';
      default:
        return this.i18n.formatCodeLabel(mode);
    }
  }
}
