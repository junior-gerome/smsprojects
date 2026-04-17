import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { I18nService } from '../../../core/services/i18n.service';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import { DashboardData } from '../domain/dashboard.models';

interface AnalyticsOverviewResponse {
  totalUsers: number;
  totalContacts: number;
  totalGroups: number;
  totalCampaigns: number;
  scheduledCampaigns: number;
  totalMessages: number;
  deliveredMessages: number;
  failedMessages: number;
  activeAutomations: number;
  deliveryRate: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly i18n = inject(I18nService);

  async getDashboardData(): Promise<DashboardData> {
    const analytics = await firstValueFrom(this.http.get<AnalyticsOverviewResponse>(`${this.apiBaseUrl}/analytics`));
    const isFrench = this.i18n.language() === 'fr';
    const processingMessages = Math.max(
      analytics.totalMessages - analytics.deliveredMessages - analytics.failedMessages,
      0
    );

    return {
      stats: [
        {
          label: isFrench ? 'SMS envoyes' : 'Messages sent',
          value: this.i18n.formatNumber(analytics.totalMessages),
          change: isFrench
            ? `${this.i18n.formatNumber(analytics.totalCampaigns)} campagnes`
            : `${this.i18n.formatNumber(analytics.totalCampaigns)} campaigns`,
          trend: analytics.totalMessages > 0 ? 'up' : 'flat',
          tone: 'primary',
          icon: 'send',
          helper: isFrench ? 'volume total orchestre' : 'total orchestrated volume'
        },
        {
          label: isFrench ? 'Delivrabilite' : 'Delivery rate',
          value: `${analytics.deliveryRate.toFixed(1)}%`,
          change: isFrench
            ? `${this.i18n.formatNumber(analytics.deliveredMessages)} livres`
            : `${this.i18n.formatNumber(analytics.deliveredMessages)} delivered`,
          trend: analytics.deliveryRate >= 95 ? 'up' : 'down',
          tone: analytics.deliveryRate >= 95 ? 'success' : 'danger',
          icon: 'verified',
          helper: isFrench ? 'sur le perimetre courant' : 'across the current scope'
        },
        {
          label: isFrench ? 'Contacts' : 'Contacts',
          value: this.i18n.formatNumber(analytics.totalContacts),
          change: isFrench
            ? `${this.i18n.formatNumber(analytics.totalGroups)} groupes`
            : `${this.i18n.formatNumber(analytics.totalGroups)} groups`,
          trend: analytics.totalContacts > 0 ? 'up' : 'flat',
          tone: 'neutral',
          icon: 'contacts',
          helper: isFrench ? 'base active synchronisee' : 'synchronized active base'
        },
        {
          label: isFrench ? 'Automations' : 'Automations',
          value: this.i18n.formatNumber(analytics.activeAutomations),
          change: isFrench
            ? `${this.i18n.formatNumber(analytics.scheduledCampaigns)} campagnes planifiees`
            : `${this.i18n.formatNumber(analytics.scheduledCampaigns)} scheduled campaigns`,
          trend: analytics.activeAutomations > 0 ? 'up' : 'flat',
          tone: 'primary',
          icon: 'robot_2',
          helper: isFrench ? 'workflows actuellement actifs' : 'currently active workflows'
        }
      ],
      volume: [
        { label: isFrench ? 'Lun' : 'Mon', value: 28 },
        { label: isFrench ? 'Mar' : 'Tue', value: 42 },
        { label: isFrench ? 'Mer' : 'Wed', value: 36 },
        { label: isFrench ? 'Jeu' : 'Thu', value: Math.min(88, Math.max(analytics.deliveryRate, 12)), emphasis: true },
        { label: isFrench ? 'Ven' : 'Fri', value: 54 },
        { label: isFrench ? 'Sam' : 'Sat', value: 31 },
        { label: isFrench ? 'Dim' : 'Sun', value: 22 }
      ],
      distribution: [
        { label: isFrench ? 'Livres' : 'Delivered', value: this.i18n.formatNumber(analytics.deliveredMessages), tone: 'success' },
        { label: isFrench ? 'En file' : 'Processing', value: this.i18n.formatNumber(processingMessages), tone: 'primary' },
        { label: isFrench ? 'Echecs' : 'Failed', value: this.i18n.formatNumber(analytics.failedMessages), tone: 'danger' }
      ],
      activity: [
        {
          id: 'act-messages',
          title: isFrench ? 'Flux SMS consolide' : 'Consolidated SMS stream',
          description: isFrench
            ? `${this.i18n.formatNumber(analytics.totalMessages)} messages traites dans le perimetre courant.`
            : `${this.i18n.formatNumber(analytics.totalMessages)} messages processed in the current scope.`,
          time: isFrench ? 'Live' : 'Live',
          icon: 'bolt',
          tone: 'primary'
        },
        {
          id: 'act-groups',
          title: isFrench ? 'Segmentation active' : 'Active segmentation',
          description: isFrench
            ? `${this.i18n.formatNumber(analytics.totalGroups)} groupes exploitables pour les campagnes.`
            : `${this.i18n.formatNumber(analytics.totalGroups)} groups available for campaigns.`,
          time: isFrench ? 'Live' : 'Live',
          icon: 'groups',
          tone: 'success'
        },
        {
          id: 'act-failed',
          title: isFrench ? 'Surveillance qualite' : 'Quality watch',
          description: isFrench
            ? `${this.i18n.formatNumber(analytics.failedMessages)} echec(s) detecte(s) a investiguer.`
            : `${this.i18n.formatNumber(analytics.failedMessages)} failure(s) detected for investigation.`,
          time: isFrench ? 'Live' : 'Live',
          icon: 'monitoring',
          tone: analytics.failedMessages > 0 ? 'danger' : 'success'
        }
      ]
    };
  }
}
