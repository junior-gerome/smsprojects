import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiStatusChipComponent } from '../../../../shared/ui/status-chip.component';
import { I18nService } from '../../../../core/services/i18n.service';
import { CreatePlatformUserRequest, PlatformUser } from '../../domain/settings.models';

@Component({
  selector: 'app-users-settings',
  standalone: true,
  imports: [ReactiveFormsModule, UiStatusChipComponent],
  template: `
    <section class="section-card space-y-6">
      <div>
        <p class="eyebrow">{{ i18n.language() === 'fr' ? 'Architecture equipe' : 'Team architecture' }}</p>
        <h2 class="mt-2 text-lg font-bold text-on-surface">{{ i18n.language() === 'fr' ? 'Utilisateurs' : 'Users' }}</h2>
        <p class="mt-2 text-sm text-on-surface-variant">
          {{
            i18n.language() === 'fr'
              ? 'Creation de comptes operateurs et administration des acces par role.'
              : 'Create operator accounts and manage role-based access.'
          }}
        </p>
      </div>

      <form class="grid gap-3 rounded-[1.5rem] bg-surface-container-low p-4" [formGroup]="form" (ngSubmit)="submit()">
        <label class="space-y-2 text-sm font-semibold text-on-surface">
          <span>{{ i18n.language() === 'fr' ? 'Nom complet' : 'Full name' }}</span>
          <input class="input-shell" type="text" formControlName="fullName" />
        </label>

        <label class="space-y-2 text-sm font-semibold text-on-surface">
          <span>Email</span>
          <input class="input-shell" type="email" formControlName="email" />
        </label>

        <label class="space-y-2 text-sm font-semibold text-on-surface">
          <span>{{ i18n.language() === 'fr' ? 'Mot de passe initial' : 'Initial password' }}</span>
          <input class="input-shell" type="password" formControlName="password" />
        </label>

        <label class="space-y-2 text-sm font-semibold text-on-surface">
          <span>{{ i18n.language() === 'fr' ? 'Role principal' : 'Primary role' }}</span>
          <select class="input-shell" formControlName="role">
            @for (role of availableRoles(); track role) {
              <option [value]="role">{{ roleLabel(role) }}</option>
            }
          </select>
        </label>

        @if (createError()) {
          <div class="rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
            {{ createError() }}
          </div>
        }

        @if (createSuccess()) {
          <div class="rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
            {{ createSuccess() }}
          </div>
        }

        <button type="submit" class="btn-primary justify-center" [disabled]="saving()">
          <span class="material-symbols-outlined">person_add</span>
          {{ saving() ? (i18n.language() === 'fr' ? 'Creation en cours...' : 'Creating...') : (i18n.language() === 'fr' ? 'Creer le compte' : 'Create account') }}
        </button>
      </form>

      <div class="space-y-3">
        @for (user of users(); track user.id) {
          <article class="rounded-[1.5rem] bg-surface-container-low p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h3 class="text-sm font-bold text-on-surface">{{ user.name }}</h3>
                <p class="mt-1 text-sm text-on-surface-variant">{{ user.email }} - {{ roleLabel(user.role) }}</p>
              </div>
              <ui-status-chip [label]="statusLabel(user.status)" [tone]="user.status === 'active' ? 'success' : 'warning'" />
            </div>
          </article>
        }
      </div>
    </section>
  `
})
export class UsersSettingsComponent {
  private readonly formBuilder = inject(FormBuilder);
  protected readonly i18n = inject(I18nService);

  readonly users = input.required<PlatformUser[]>();
  readonly availableRoles = input.required<string[]>();
  readonly saving = input(false);
  readonly createError = input<string | null>(null);
  readonly createSuccess = input<string | null>(null);
  readonly createUser = output<CreatePlatformUserRequest>();

  protected readonly form = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['OPERATOR', [Validators.required]]
  });

  protected statusLabel(status: PlatformUser['status']): string {
    return status === 'active'
      ? this.i18n.language() === 'fr'
        ? 'active'
        : 'active'
      : this.i18n.language() === 'fr'
        ? 'en attente'
        : 'pending';
  }

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

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.createUser.emit({
      fullName: value.fullName,
      email: value.email,
      password: value.password,
      roles: [value.role]
    });
    this.form.patchValue({ password: '', role: value.role });
  }
}
