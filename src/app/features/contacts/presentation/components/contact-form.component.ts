import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { I18nService } from '../../../../core/services/i18n.service';
import { ContactDraft, ContactGroupOption } from '../../domain/contacts.models';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: `./contact-form.component.html`
})
export class ContactFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  protected readonly i18n = inject(I18nService);
  readonly groups = input.required<ContactGroupOption[]>();
  readonly saving = input(false);
  readonly submit = output<ContactDraft>();
  readonly cancel = output<void>();

  protected readonly form = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(80)]],
    lastName: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.email, Validators.maxLength(180)]],
    phoneNumber: ['', [Validators.required, Validators.maxLength(30)]],
    groupIds: this.formBuilder.nonNullable.control<string[]>([]),
    tags: ['']
  });

  protected submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submit.emit(this.form.getRawValue());
  }
}
