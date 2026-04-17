export interface ChatMessage {
  id: string;
  author: 'agent' | 'contact';
  content: string;
  time: string;
  status?: string;
}

export interface Conversation {
  id: string;
  contactId: string;
  name: string;
  initials: string;
  phoneNumber: string;
  preview: string;
  status: 'online' | 'away' | 'queued';
  lastSeen: string;
  messages: ChatMessage[];
}
