import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./login-page.component.html"
})
export class LoginPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly i18n = inject(I18nService);
  protected readonly authService = inject(AuthService);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  protected async submit(): Promise<void> {
    this.errorMessage.set(null);
    this.authService.clearError();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set(this.i18n.t('login.validation'));
      return;
    }

    try {
      await this.authService.login(this.form.getRawValue());
      const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') ?? '/dashboard';
      await this.router.navigateByUrl(redirectTo);
    } catch {
      this.errorMessage.set(this.authService.error() ?? this.i18n.t('login.failed'));
    }
  }
}
