import { NgClass } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { I18nService } from '../../../../core/services/i18n.service';
import { Conversation } from '../../domain/chat.models';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [NgClass],
  templateUrl: `./chat-window.component.html`
})
export class ChatWindowComponent {
  protected readonly i18n = inject(I18nService);
  readonly conversation = input<Conversation | undefined>(undefined);

  protected statusLabel(status: Conversation['status']): string {
    if (status === 'online') {
      return this.i18n.language() === 'fr' ? 'en ligne' : 'online';
    }
    if (status === 'queued') {
      return this.i18n.language() === 'fr' ? 'en file' : 'queued';
    }
    return this.i18n.language() === 'fr' ? 'absent' : 'away';
  }

  protected messageStatusLabel(status: string): string {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return this.i18n.language() === 'fr' ? 'livre' : 'delivered';
      case 'FAILED':
        return this.i18n.language() === 'fr' ? 'echec' : 'failed';
      case 'QUEUED':
        return this.i18n.language() === 'fr' ? 'en file' : 'queued';
      case 'PROCESSING':
        return this.i18n.language() === 'fr' ? 'traitement' : 'processing';
      default:
        return this.i18n.formatCodeLabel(status);
    }
  }
}
