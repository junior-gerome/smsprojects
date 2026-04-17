import { FormsModule } from '@angular/forms';
import { Component, inject, input, output, signal } from '@angular/core';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: `./message-input.component.html`
})
export class MessageInputComponent {
  protected readonly i18n = inject(I18nService);
  readonly submit = output<string>();
  readonly disabled = input(false);
  readonly sending = input(false);
  readonly message = signal('');

  sendMessage(): void {
    if (!this.message().trim()) {
      return;
    }

    this.submit.emit(this.message());
    this.message.set('');
  }
}
