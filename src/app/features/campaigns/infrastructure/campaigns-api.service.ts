import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PageResponse } from '../../../core/models/api.models';
import { I18nService } from '../../../core/services/i18n.service';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import { AudienceOption, CampaignState, CampaignSummary, CampaignVariable, TemplateOption } from '../domain/campaigns.models';

interface GroupApiResponse {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
}

interface ContactApiResponse {
  id: string;
  fullName: string;
  email: string | null;
  phoneNumber: string;
  status: string;
  tags: string[];
  groups: string[];
  createdAt: string;
}

interface CampaignApiResponse {
  id: string;
  name: string;
  status: 'PROCESSING' | 'SCHEDULED' | 'COMPLETED' | 'FAILED';
  scheduleAt: string | null;
  totalRecipients: number;
  deliveredCount: number;
  failedCount: number;
  createdAt: string;
  targetContactIds: string[];
  targetGroupIds: string[];
}

interface TemplateApiResponse {
  id: string;
  name: string;
  description: string | null;
  content: string;
}

@Injectable({ providedIn: 'root' })
export class CampaignsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly i18n = inject(I18nService);

  private get defaultVariables(): CampaignVariable[] {
    return this.i18n.language() === 'fr'
      ? [
          { label: 'Prenom', token: '{{prenom}}', helper: '{{prenom}}' },
          { label: 'Entreprise', token: '{{entreprise}}', helper: '{{entreprise}}' },
          { label: 'Code promo', token: '{{code_promo}}', helper: '{{code_promo}}' }
        ]
      : [
          { label: 'First name', token: '{{first_name}}', helper: '{{first_name}}' },
          { label: 'Company', token: '{{company}}', helper: '{{company}}' },
          { label: 'Promo code', token: '{{coupon_code}}', helper: '{{coupon_code}}' }
        ];
  }

  async getCampaignState(): Promise<CampaignState> {
    const [groups, contactsPage, campaigns, templates] = await Promise.all([
      firstValueFrom(this.http.get<GroupApiResponse[]>(`${this.apiBaseUrl}/groups`)),
      firstValueFrom(
        this.http.get<PageResponse<ContactApiResponse>>(`${this.apiBaseUrl}/contacts`, {
          params: { page: 0, size: 1000 }
        })
      ),
      firstValueFrom(
        this.http.get<PageResponse<CampaignApiResponse>>(`${this.apiBaseUrl}/campaigns`, {
          params: { page: 0, size: 6 }
        })
      ),
      firstValueFrom(this.http.get<TemplateApiResponse[]>(`${this.apiBaseUrl}/templates`))
    ]);

    const audiences = [
      ...this.mapDirectContactAudiences(contactsPage.items),
      ...groups.map((group) => this.mapAudience(group))
    ];
    const templateOptions = templates.map((template) => this.mapTemplate(template));
    const selectedTemplate = templateOptions[0];

    return {
      name: '',
      message: selectedTemplate?.content ?? '',
      audiences,
      selectedAudienceId: audiences[0]?.id ?? '',
      scheduleMode: 'now',
      scheduleAt: '',
      shortenLinks: true,
      recentCampaigns: campaigns.items.map((campaign) => this.mapCampaignSummary(campaign, audiences)),
      variables: this.defaultVariables,
      templates: templateOptions,
      selectedTemplateId: selectedTemplate?.id ?? '',
      loading: false,
      saving: false,
      error: null,
      successMessage: null
    };
  }

  async createCampaign(payload: {
    name: string;
    content: string;
    templateId: string | null;
    scheduleAt: string | null;
    targetContactIds: string[];
    targetGroupIds: string[];
    sendNow: boolean;
  }): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.apiBaseUrl}/campaigns`, {
        name: payload.name,
        content: payload.content,
        templateId: payload.templateId,
        scheduleAt: payload.scheduleAt ? this.normalizeScheduleAt(payload.scheduleAt) : null,
        targetContactIds: payload.targetContactIds,
        targetGroupIds: payload.targetGroupIds,
        sendNow: payload.sendNow
      })
    );
  }

  private normalizeScheduleAt(scheduleAt: string): string {
    return scheduleAt.length === 16 ? `${scheduleAt}:00` : scheduleAt;
  }

  private mapAudience(group: GroupApiResponse): AudienceOption {
    return {
      id: group.id,
      label: group.name,
      recipients: String(group.memberCount),
      description:
        group.description ||
        (this.i18n.language() === 'fr'
          ? 'Audience synchronisee depuis la plateforme.'
          : 'Audience synchronized from the platform.'),
      sourceType: 'group',
      targetGroupIds: [group.id],
      targetContactIds: []
    };
  }

  private mapDirectContactAudiences(contacts: ContactApiResponse[]): AudienceOption[] {
    if (!contacts.length) {
      return [];
    }

    return [
      {
        id: 'direct-contacts',
        label: this.i18n.language() === 'fr' ? 'Tous les contacts' : 'All contacts',
        recipients: String(contacts.length),
        description:
          this.i18n.language() === 'fr'
            ? 'Audience directe construite a partir des contacts existants.'
            : 'Direct audience built from existing contacts.',
        sourceType: 'contacts',
        targetGroupIds: [],
        targetContactIds: contacts.map((contact) => contact.id)
      }
    ];
  }

  private mapTemplate(template: TemplateApiResponse): TemplateOption {
    return {
      id: template.id,
      name: template.name,
      description:
        template.description ?? (this.i18n.language() === 'fr' ? 'Template reutilisable' : 'Reusable template'),
      content: template.content
    };
  }

  private mapCampaignSummary(campaign: CampaignApiResponse, audiences: AudienceOption[]): CampaignSummary {
    const targetedAudiences = audiences
      .filter((audience) => campaign.targetGroupIds.includes(audience.id))
      .map((audience) => audience.label);
    const audience =
      targetedAudiences.length > 0
        ? targetedAudiences.join(', ')
        : campaign.targetContactIds.length > 0
          ? this.i18n.language() === 'fr'
            ? `${campaign.targetContactIds.length} contact(s) directs`
            : `${campaign.targetContactIds.length} direct contact(s)`
          : this.i18n.language() === 'fr'
            ? 'Audience securisee'
            : 'Secured audience';

    return {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status.toLowerCase() as CampaignSummary['status'],
      audience,
      engagement:
        this.i18n.language() === 'fr'
          ? `${campaign.deliveredCount}/${campaign.totalRecipients} livres`
          : `${campaign.deliveredCount}/${campaign.totalRecipients} delivered`
    };
  }
}
