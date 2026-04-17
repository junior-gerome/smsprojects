import { Component, computed, inject } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { UiPageHeaderComponent } from '../../../shared/ui/page-header.component';
import { ChatFacade } from '../application/chat.facade';
import { ChatWindowComponent } from './components/chat-window.component';
import { ConversationListComponent } from './components/conversation-list.component';
import { MessageInputComponent } from './components/message-input.component';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [UiPageHeaderComponent, ConversationListComponent, ChatWindowComponent, MessageInputComponent],
  providers: [ChatFacade],
  templateUrl: `./chat-page.component.html`
})
export class ChatPageComponent {
  protected readonly facade = inject(ChatFacade);
  protected readonly i18n = inject(I18nService);
  protected readonly selectedId = computed(() => this.facade.selectedConversation()?.id ?? '');
}
