import { Component, inject, input } from '@angular/core';
import { I18nService } from '../../../../core/services/i18n.service';
import { PlatformRole } from '../../domain/settings.models';

@Component({
  selector: 'app-roles-settings',
  standalone: true,
  template: `
    <section class="section-card">
      <div class="mb-6">
        <p class="eyebrow">{{ i18n.language() === 'fr' ? 'Permissions' : 'Permissions' }}</p>
        <h2 class="mt-2 text-lg font-bold text-on-surface">{{ i18n.language() === 'fr' ? 'Roles' : 'Roles' }}</h2>
      </div>

      <div class="space-y-3">
        @for (role of roles(); track role.id) {
          <article class="rounded-[1.5rem] bg-surface-container-low p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h3 class="text-sm font-bold text-on-surface">{{ roleLabel(role.name) }}</h3>
                <p class="mt-1 text-sm text-on-surface-variant">
                  {{ i18n.language() === 'fr' ? role.members + ' membre(s)' : role.members + ' member(s)' }}
                </p>
              </div>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              @for (permission of role.permissions; track permission) {
                <span class="rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold text-on-surface-variant">{{ permission }}</span>
              }
            </div>
          </article>
        }
      </div>
    </section>
  `
})
export class RolesSettingsComponent {
  protected readonly i18n = inject(I18nService);
  readonly roles = input.required<PlatformRole[]>();

  protected roleLabel(role: string): string {
    switch (role) {
      case 'ADMIN':
        return this.i18n.language() === 'fr' ? 'Administrateur' : 'Administrator';
      case 'MANAGER':
        return this.i18n.language() === 'fr' ? 'Manager' : 'Manager';
      case 'ANALYST':
        return this.i18n.language() === 'fr' ? 'Analyste' : 'Analyst';
      case 'OPERATOR':
        return this.i18n.language() === 'fr' ? 'Operateur' : 'Operator';
      default:
        return this.i18n.formatCodeLabel(role);
    }
  }
}
