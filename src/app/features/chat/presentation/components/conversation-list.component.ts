import { Component, inject, input, output } from '@angular/core';
import { UiStatusChipComponent } from '../../../../shared/ui/status-chip.component';
import { I18nService } from '../../../../core/services/i18n.service';
import { Conversation } from '../../domain/chat.models';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [UiStatusChipComponent],
  templateUrl: `./conversation-list.component.html`
})
export class ConversationListComponent {
  protected readonly i18n = inject(I18nService);
  readonly conversations = input.required<Conversation[]>();
  readonly selectedId = input.required<string>();
  readonly select = output<string>();

  conversationButtonClass(conversationId: string): string {
    const baseClass = 'w-full rounded-[1.5rem] p-4 text-left transition';
    return this.selectedId() === conversationId ? `${baseClass} bg-primary/10` : `${baseClass} bg-surface-container-low`;
  }

  protected statusLabel(status: Conversation['status']): string {
    if (status === 'online') {
      return this.i18n.language() === 'fr' ? 'en ligne' : 'online';
    }
    if (status === 'queued') {
      return this.i18n.language() === 'fr' ? 'en file' : 'queued';
    }
    return this.i18n.language() === 'fr' ? 'absent' : 'away';
  }

  tone(status: Conversation['status']): 'success' | 'warning' | 'neutral' {
    if (status === 'online') {
      return 'success';
    }
    if (status === 'queued') {
      return 'warning';
    }

    return 'neutral';
  }
}
