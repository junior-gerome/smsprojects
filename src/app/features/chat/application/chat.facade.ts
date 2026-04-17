import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { extractApiErrorMessage } from '../../../core/models/api.models';
import { I18nService } from '../../../core/services/i18n.service';
import { Conversation } from '../domain/chat.models';
import { ChatApiService } from '../infrastructure/chat-api.service';

interface ChatState {
  conversations: Conversation[];
  selectedConversationId: string;
  loading: boolean;
  sending: boolean;
  error: string | null;
}

@Injectable()
export class ChatFacade {
  private readonly api = inject(ChatApiService);
  private readonly i18n = inject(I18nService);
  private readonly state = signal<ChatState>({
    conversations: [],
    selectedConversationId: '',
    loading: true,
    sending: false,
    error: null
  });

  readonly conversations = computed(() => this.state().conversations);
  readonly loading = computed(() => this.state().loading);
  readonly sending = computed(() => this.state().sending);
  readonly error = computed(() => this.state().error);
  readonly selectedConversation = computed(() =>
    this.state().conversations.find((conversation) => conversation.id === this.state().selectedConversationId)
  );

  constructor() {
    effect(() => {
      this.i18n.language();
      void this.load();
    }, { allowSignalWrites: true });
  }

  async load(): Promise<void> {
    this.state.update((state) => ({ ...state, loading: true, error: null }));

    try {
      const conversations = await this.api.getConversations();
      const selectedConversationId = conversations.find(
        (conversation) => conversation.id === this.state().selectedConversationId
      )?.id ?? conversations[0]?.id ?? '';

      this.state.update((state) => ({
        ...state,
        conversations,
        selectedConversationId,
        loading: false
      }));
    } catch (error) {
      this.state.update((state) => ({
        ...state,
        loading: false,
        error: extractApiErrorMessage(
          error,
          this.i18n.language() === 'fr' ? 'Impossible de charger les conversations.' : 'Unable to load conversations.'
        )
      }));
    }
  }

  selectConversation(id: string): void {
    this.state.update((state) => ({ ...state, selectedConversationId: id }));
  }

  async sendMessage(content: string): Promise<void> {
    const selectedConversation = this.selectedConversation();
    if (!content.trim() || !selectedConversation) {
      return;
    }

    this.state.update((state) => ({ ...state, sending: true, error: null }));

    try {
      await this.api.sendMessage(selectedConversation.contactId, content.trim());
      await this.load();
      this.state.update((state) => ({
        ...state,
        sending: false,
        selectedConversationId: selectedConversation.id
      }));
    } catch (error) {
      this.state.update((state) => ({
        ...state,
        sending: false,
        error: extractApiErrorMessage(
          error,
          this.i18n.language() === 'fr'
            ? "Impossible d'envoyer la reponse SMS."
            : 'Unable to send the SMS reply.'
        )
      }));
    }
  }

  sendQuickReply(): void {
    void this.sendMessage(
      this.i18n.language() === 'fr'
        ? 'Merci, votre demande a bien ete prise en charge. Un operateur vous recontacte sous peu.'
        : 'Thank you, your request has been taken into account. An operator will contact you shortly.'
    );
  }
}
