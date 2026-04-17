import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { I18nService } from '../../../../core/services/i18n.service';
import { TemplateDraft } from '../../domain/templates.models';

@Component({
  selector: 'app-template-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: `./template-form.component.html`
})
export class TemplateFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  protected readonly i18n = inject(I18nService);
  readonly saving = input(false);
  readonly submit = output<TemplateDraft>();
  readonly cancel = output<void>();

  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.maxLength(300)]],
    body: ['', [Validators.required, Validators.maxLength(1000)]]
  });

  protected submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submit.emit(this.form.getRawValue());
  }
}
