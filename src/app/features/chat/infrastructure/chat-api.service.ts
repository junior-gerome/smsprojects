import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { I18nService } from '../../../core/services/i18n.service';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import { Conversation } from '../domain/chat.models';

interface ConversationMessageApiResponse {
  id: string;
  author: 'agent' | 'contact';
  content: string;
  status: string;
  createdAt: string;
}

interface ConversationApiResponse {
  id: string;
  contactId: string;
  contactName: string;
  contactPhoneNumber: string;
  initials: string;
  preview: string;
  status: Conversation['status'];
  lastMessageAt: string | null;
  messages: ConversationMessageApiResponse[];
}

@Injectable({ providedIn: 'root' })
export class ChatApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly i18n = inject(I18nService);

  async getConversations(): Promise<Conversation[]> {
    const conversations = await firstValueFrom(this.http.get<ConversationApiResponse[]>(`${this.apiBaseUrl}/conversations`));

    return conversations.map((conversation) => ({
      id: conversation.id,
      contactId: conversation.contactId,
      name: conversation.contactName,
      initials: conversation.initials,
      phoneNumber: conversation.contactPhoneNumber,
      preview: conversation.preview,
      status: conversation.status,
      lastSeen: this.formatLastSeen(conversation.lastMessageAt),
      messages: conversation.messages.map((message) => ({
        id: message.id,
        author: message.author,
        content: message.content,
        time: this.formatMessageTime(message.createdAt),
        status: message.status
      }))
    }));
  }

  async sendMessage(contactId: string, content: string): Promise<void> {
    await firstValueFrom(this.http.post(`${this.apiBaseUrl}/sms/send`, { contactId, content }));
  }

  private formatLastSeen(lastMessageAt: string | null): string {
    if (!lastMessageAt) {
      return this.i18n.language() === 'fr' ? 'Aucune activite' : 'No activity yet';
    }

    const timestamp = new Date(lastMessageAt);
    const deltaMinutes = Math.round((Date.now() - timestamp.getTime()) / 60000);

    if (deltaMinutes <= 1) {
      return this.i18n.language() === 'fr' ? 'Maintenant' : 'Now';
    }
    if (deltaMinutes < 60) {
      return `${deltaMinutes} min`;
    }
    if (deltaMinutes < 1440) {
      return `${Math.round(deltaMinutes / 60)} h`;
    }

    return this.i18n.formatDate(timestamp, {
      day: '2-digit',
      month: 'short'
    });
  }

  private formatMessageTime(createdAt: string): string {
    return this.i18n.formatTime(createdAt);
  }
}
