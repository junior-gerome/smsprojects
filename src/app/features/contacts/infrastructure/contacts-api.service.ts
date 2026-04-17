import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PageResponse } from '../../../core/models/api.models';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import { Contact, ContactDraft, ContactGroupDraft, ContactGroupOption } from '../domain/contacts.models';

interface ContactApiResponse {
  id: string;
  fullName: string;
  email: string | null;
  phoneNumber: string;
  status: Contact['status'];
  tags: string[];
  groups: string[];
  createdAt: string;
}

interface GroupApiResponse {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  createdAt: string;
}

interface ImportContactsApiResponse {
  importedCount: number;
  failedCount: number;
  totalRequested: number;
}

@Injectable({ providedIn: 'root' })
export class ContactsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  async getContacts(page = 0, size = 20): Promise<PageResponse<Contact>> {
    const response = await firstValueFrom(
      this.http.get<PageResponse<ContactApiResponse>>(`${this.apiBaseUrl}/contacts`, {
        params: { page, size }
      })
    );

    return {
      ...response,
      items: response.items.map((contact) => this.mapContact(contact))
    };
  }

  async getGroups(): Promise<ContactGroupOption[]> {
    const groups = await firstValueFrom(this.http.get<GroupApiResponse[]>(`${this.apiBaseUrl}/groups`));
    return groups.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      memberCount: group.memberCount,
      createdAt: group.createdAt
    }));
  }

  async createContact(draft: ContactDraft): Promise<Contact> {
    const response = await firstValueFrom(
      this.http.post<ContactApiResponse>(`${this.apiBaseUrl}/contacts`, {
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        email: draft.email.trim() || null,
        phoneNumber: draft.phoneNumber.trim(),
        groupIds: draft.groupIds,
        tags: draft.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      })
    );

    return this.mapContact(response);
  }

  async createGroup(draft: ContactGroupDraft): Promise<ContactGroupOption> {
    const group = await firstValueFrom(
      this.http.post<GroupApiResponse>(`${this.apiBaseUrl}/groups`, {
        name: draft.name.trim(),
        description: draft.description.trim() || null
      })
    );

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      memberCount: group.memberCount,
      createdAt: group.createdAt
    };
  }

  async importContacts(
    contacts: Array<{
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      groupIds: string[];
      tags: string[];
    }>
  ): Promise<ImportContactsApiResponse> {
    return firstValueFrom(
      this.http.post<ImportContactsApiResponse>(`${this.apiBaseUrl}/contacts/import`, {
        contacts: contacts.map((contact) => ({
          firstName: contact.firstName.trim(),
          lastName: contact.lastName.trim(),
          email: contact.email.trim() || null,
          phoneNumber: contact.phoneNumber.trim(),
          groupIds: contact.groupIds,
          tags: contact.tags.map((tag) => tag.trim()).filter(Boolean)
        }))
      })
    );
  }

  private mapContact(contact: ContactApiResponse): Contact {
    return {
      id: contact.id,
      fullName: contact.fullName,
      email: contact.email,
      phoneNumber: contact.phoneNumber,
      status: contact.status,
      tags: contact.tags,
      groups: contact.groups,
      createdAt: contact.createdAt
    };
  }
}
