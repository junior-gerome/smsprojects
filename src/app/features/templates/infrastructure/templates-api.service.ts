import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { I18nService } from '../../../core/services/i18n.service';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import { MessageTemplate, TemplateDraft } from '../domain/templates.models';

interface TemplateApiResponse {
  id: string;
  name: string;
  description: string | null;
  content: string;
}

@Injectable({ providedIn: 'root' })
export class TemplatesApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly i18n = inject(I18nService);

  async getTemplates(): Promise<MessageTemplate[]> {
    const templates = await firstValueFrom(this.http.get<TemplateApiResponse[]>(`${this.apiBaseUrl}/templates`));

    return templates.map((template) => ({
      id: template.id,
      name: template.name,
      category: this.i18n.language() === 'fr' ? 'Sync backend' : 'Backend sync',
      description:
        template.description ??
        (this.i18n.language() === 'fr'
          ? 'Template SMS synchronise depuis Spring Boot.'
          : 'SMS template synchronized from Spring Boot.'),
      body: template.content,
      variables: template.content.match(/{{[^}]+}}/g) ?? [],
      usage: this.i18n.language() === 'fr' ? 'API live' : 'Live API'
    }));
  }

  async createTemplate(draft: TemplateDraft): Promise<MessageTemplate> {
    const template = await firstValueFrom(
      this.http.post<TemplateApiResponse>(`${this.apiBaseUrl}/templates`, {
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        content: draft.body.trim()
      })
    );

    return {
      id: template.id,
      name: template.name,
      category: this.i18n.language() === 'fr' ? 'Sync backend' : 'Backend sync',
      description:
        template.description ??
        (this.i18n.language() === 'fr'
          ? 'Template SMS synchronise depuis Spring Boot.'
          : 'SMS template synchronized from Spring Boot.'),
      body: template.content,
      variables: template.content.match(/{{[^}]+}}/g) ?? [],
      usage: this.i18n.language() === 'fr' ? 'API live' : 'Live API'
    };
  }
}
