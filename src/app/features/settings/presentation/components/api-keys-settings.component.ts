import { Component, inject, input } from '@angular/core';
import { UiStatusChipComponent } from '../../../../shared/ui/status-chip.component';
import { I18nService } from '../../../../core/services/i18n.service';
import { ApiKey } from '../../domain/settings.models';

@Component({
  selector: 'app-api-keys-settings',
  standalone: true,
  imports: [UiStatusChipComponent],
  template: `
    <section class="section-card">
      <div class="mb-6">
        <p class="eyebrow">{{ i18n.language() === 'fr' ? "Protocoles d'acces" : 'Access protocols' }}</p>
        <h2 class="mt-2 text-lg font-bold text-on-surface">{{ i18n.language() === 'fr' ? 'Cles API' : 'API keys' }}</h2>
      </div>

      <div class="space-y-3">
        @for (apiKey of apiKeys(); track apiKey.id) {
          <article class="rounded-[1.5rem] bg-surface-container-low p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h3 class="text-sm font-bold text-on-surface">{{ apiKey.label }}</h3>
                <p class="mt-1 text-sm text-on-surface-variant">
                  {{ scopeLabel(apiKey.scope) }} · {{ lastUsedLabel(apiKey.lastUsedAt) }}
                </p>
              </div>
              <ui-status-chip [label]="statusLabel(apiKey.status)" [tone]="apiKey.status === 'active' ? 'success' : 'warning'" />
            </div>
          </article>
        }
      </div>
    </section>
  `
})
export class ApiKeysSettingsComponent {
  protected readonly i18n = inject(I18nService);
  readonly apiKeys = input.required<ApiKey[]>();

  protected statusLabel(status: ApiKey['status']): string {
    return status === 'active'
      ? this.i18n.language() === 'fr'
        ? 'active'
        : 'active'
      : this.i18n.language() === 'fr'
        ? 'rotation'
        : 'rotate';
  }

  protected lastUsedLabel(lastUsedAt: string | null): string {
    if (!lastUsedAt) {
      return this.i18n.language() === 'fr' ? 'Jamais utilisee' : 'Never used';
    }

    const formatter = new Intl.DateTimeFormat(this.i18n.language(), {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    return this.i18n.language() === 'fr'
      ? `Derniere utilisation ${formatter.format(new Date(lastUsedAt))}`
      : `Last used ${formatter.format(new Date(lastUsedAt))}`;
  }

  protected scopeLabel(scope: string[]): string {
    return scope
      .map((part) => this.i18n.formatCodeLabel(part))
      .filter(Boolean)
      .join(' · ');
  }
}
