import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { I18nService } from '../../../../core/services/i18n.service';
import { ContactGroupDraft } from '../../domain/contacts.models';

@Component({
  selector: 'app-contact-group-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: `./contact-groupe-form.component.html`
})
export class ContactGroupFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  protected readonly i18n = inject(I18nService);
  readonly saving = input(false);
  readonly submit = output<ContactGroupDraft>();
  readonly cancel = output<void>();

  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.maxLength(300)]]
  });

  protected submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submit.emit(this.form.getRawValue());
  }
}
