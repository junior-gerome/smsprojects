import { computed, inject, Injectable, signal } from '@angular/core';
import { extractApiErrorMessage } from '../../../core/models/api.models';
import { I18nService } from '../../../core/services/i18n.service';
import { AnalyticsMetric, AnalyticsPoint, ReportItem } from '../domain/analytics.models';
import { AnalyticsApiService, AnalyticsOverviewResponse } from '../infrastructure/analytics-api.service';

type AnalyticsFocus = 'delivery' | 'campaigns' | 'audience';

interface AnalyticsState {
  overview: AnalyticsOverviewResponse | null;
  loading: boolean;
  error: string | null;
  focus: AnalyticsFocus;
}

@Injectable()
export class AnalyticsFacade {
  private readonly api = inject(AnalyticsApiService);
  private readonly i18n = inject(I18nService);
  private readonly state = signal<AnalyticsState>({
    overview: null,
    loading: true,
    error: null,
    focus: 'delivery'
  });

  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly focus = computed(() => this.state().focus);
  readonly focusLabel = computed(() => {
    switch (this.state().focus) {
      case 'campaigns':
        return this.i18n.language() === 'fr' ? 'Campagnes' : 'Campaigns';
      case 'audience':
        return this.i18n.language() === 'fr' ? 'Audience' : 'Audience';
      default:
        return this.i18n.language() === 'fr' ? 'Delivrabilite' : 'Delivery';
    }
  });

  readonly metrics = computed<AnalyticsMetric[]>(() => {
    const overview = this.state().overview;
    if (!overview) {
      return [];
    }

    const queuedMessages = Math.max(overview.totalMessages - overview.deliveredMessages - overview.failedMessages, 0);
    const isFrench = this.i18n.language() === 'fr';

    return [
      {
        label: isFrench ? 'SMS envoyes' : 'Messages sent',
        value: this.i18n.formatNumber(overview.totalMessages),
        change: isFrench ? `${overview.totalCampaigns} campagnes` : `${overview.totalCampaigns} campaigns`,
        icon: 'send',
        tone: 'primary'
      },
      {
        label: isFrench ? 'Taux de delivrabilite' : 'Delivery rate',
        value: `${overview.deliveryRate.toFixed(1)}%`,
        change: isFrench
          ? `${this.i18n.formatNumber(overview.deliveredMessages)} livres`
          : `${this.i18n.formatNumber(overview.deliveredMessages)} delivered`,
        icon: 'verified',
        tone: overview.deliveryRate >= 95 ? 'success' : 'danger'
      },
      {
        label: isFrench ? 'Contacts' : 'Contacts',
        value: this.i18n.formatNumber(overview.totalContacts),
        change: isFrench ? `${overview.totalGroups} groupes` : `${overview.totalGroups} groups`,
        icon: 'contacts',
        tone: 'neutral'
      },
      {
        label: isFrench ? 'Files / actifs' : 'Queued / active',
        value: this.i18n.formatNumber(queuedMessages),
        change: isFrench
          ? `${overview.activeAutomations} automations actives`
          : `${overview.activeAutomations} active automations`,
        icon: 'schedule_send',
        tone: queuedMessages > 0 ? 'primary' : 'success'
      }
    ];
  });

  readonly performance = computed<AnalyticsPoint[]>(() => {
    const overview = this.state().overview;
    if (!overview) {
      return [];
    }

    const totalMessages = Math.max(overview.totalMessages, 1);
    const totalCampaigns = Math.max(overview.totalCampaigns, 1);
    const totalContacts = Math.max(overview.totalContacts, 1);
    const totalUsers = Math.max(overview.totalUsers, 1);
    const queuedMessages = Math.max(overview.totalMessages - overview.deliveredMessages - overview.failedMessages, 0);
    const isFrench = this.i18n.language() === 'fr';

    if (this.state().focus === 'campaigns') {
      return [
        {
          label: isFrench ? 'Cadence campagne' : 'Campaign cadence',
          primaryLabel: isFrench ? 'Planifie' : 'Scheduled',
          primaryValue: Math.min(Math.round((overview.scheduledCampaigns / totalCampaigns) * 100), 100),
          secondaryLabel: isFrench ? 'Livre' : 'Delivered',
          secondaryValue: Math.min(Math.round((overview.deliveredMessages / totalMessages) * 100), 100)
        },
        {
          label: isFrench ? 'Support automation' : 'Automation support',
          primaryLabel: isFrench ? 'Actif' : 'Active',
          primaryValue: Math.min(Math.round((overview.activeAutomations / totalCampaigns) * 100), 100),
          secondaryLabel: isFrench ? 'En file' : 'Queued',
          secondaryValue: Math.min(Math.round((queuedMessages / totalMessages) * 100), 100)
        },
        {
          label: isFrench ? 'Portee audience' : 'Audience reach',
          primaryLabel: isFrench ? 'Contacts par campagne' : 'Contacts per campaign',
          primaryValue: Math.min(Math.round((overview.totalContacts / totalCampaigns) * 10), 100),
          secondaryLabel: isFrench ? 'Groupes par campagne' : 'Groups per campaign',
          secondaryValue: Math.min(Math.round((overview.totalGroups / totalCampaigns) * 20), 100)
        },
        {
          label: isFrench ? 'Couverture equipe' : 'Team coverage',
          primaryLabel: isFrench ? 'Utilisateurs charges' : 'Users with load',
          primaryValue: Math.min(Math.round((overview.totalCampaigns / totalUsers) * 10), 100),
          secondaryLabel: isFrench ? 'Automations par user' : 'Automations per user',
          secondaryValue: Math.min(Math.round((overview.activeAutomations / totalUsers) * 20), 100)
        }
      ];
    }

    if (this.state().focus === 'audience') {
      return [
        {
          label: isFrench ? 'Structure audience' : 'Audience structure',
          primaryLabel: isFrench ? 'Groupes pour 100 contacts' : 'Groups per 100 contacts',
          primaryValue: Math.min(Math.round((overview.totalGroups / totalContacts) * 100), 100),
          secondaryLabel: isFrench ? 'Campagnes pour 100 contacts' : 'Campaigns per 100 contacts',
          secondaryValue: Math.min(Math.round((overview.totalCampaigns / totalContacts) * 100), 100)
        },
        {
          label: isFrench ? 'Capacite equipe' : 'Team capacity',
          primaryLabel: isFrench ? 'Contacts par utilisateur' : 'Contacts per user',
          primaryValue: Math.min(Math.round((overview.totalContacts / totalUsers) / 2), 100),
          secondaryLabel: isFrench ? 'Groupes par utilisateur' : 'Groups per user',
          secondaryValue: Math.min(Math.round((overview.totalGroups / totalUsers) * 10), 100)
        },
        {
          label: isFrench ? 'Pression messages' : 'Message pressure',
          primaryLabel: isFrench ? 'Messages par contact' : 'Messages per contact',
          primaryValue: Math.min(Math.round((overview.totalMessages / totalContacts) * 20), 100),
          secondaryLabel: isFrench ? 'Livres par contact' : 'Delivered per contact',
          secondaryValue: Math.min(Math.round((overview.deliveredMessages / totalContacts) * 20), 100)
        },
        {
          label: isFrench ? 'Profondeur automation' : 'Automation depth',
          primaryLabel: isFrench ? 'Automations par groupe' : 'Automations per group',
          primaryValue: Math.min(Math.round((overview.activeAutomations / Math.max(overview.totalGroups, 1)) * 25), 100),
          secondaryLabel: isFrench ? 'Campagnes planifiees' : 'Scheduled campaigns',
          secondaryValue: Math.min(Math.round((overview.scheduledCampaigns / totalCampaigns) * 100), 100)
        }
      ];
    }

    return [
      {
        label: isFrench ? 'Sante de delivrance' : 'Delivery health',
        primaryLabel: isFrench ? 'Livre' : 'Delivered',
        primaryValue: Math.min(Math.round((overview.deliveredMessages / totalMessages) * 100), 100),
        secondaryLabel: isFrench ? 'Echec' : 'Failed',
        secondaryValue: Math.min(Math.round((overview.failedMessages / totalMessages) * 100), 100)
      },
      {
        label: isFrench ? 'Pression de file' : 'Queue pressure',
        primaryLabel: isFrench ? 'En file' : 'Queued',
        primaryValue: Math.min(Math.round((queuedMessages / totalMessages) * 100), 100),
        secondaryLabel: isFrench ? 'Campagnes planifiees' : 'Scheduled campaigns',
        secondaryValue: Math.min(Math.round((overview.scheduledCampaigns / totalCampaigns) * 100), 100)
      },
      {
        label: isFrench ? 'Preparation audience' : 'Audience readiness',
        primaryLabel: isFrench ? 'Contacts' : 'Contacts',
        primaryValue: Math.min(Math.round((overview.totalContacts / 500) * 100), 100),
        secondaryLabel: isFrench ? 'Groupes' : 'Groups',
        secondaryValue: Math.min(Math.round((overview.totalGroups / 25) * 100), 100)
      },
      {
        label: isFrench ? 'Support automation' : 'Automation support',
        primaryLabel: isFrench ? 'Automations actives' : 'Active automations',
        primaryValue: Math.min(Math.round((overview.activeAutomations / totalCampaigns) * 100), 100),
        secondaryLabel: isFrench ? 'Utilisateurs' : 'Users',
        secondaryValue: Math.min(Math.round((overview.totalUsers / 20) * 100), 100)
      }
    ];
  });

  readonly reports = computed<ReportItem[]>(() => {
    const overview = this.state().overview;
    if (!overview) {
      return [];
    }

    const isFrench = this.i18n.language() === 'fr';

    if (this.state().focus === 'campaigns') {
      return [
        {
          id: 'campaign-execution',
          name: isFrench ? "Vue d'execution campagne" : 'Campaign execution overview',
          period: isFrench ? 'Snapshot actuel' : 'Current snapshot',
          summary: isFrench
            ? `${overview.totalCampaigns} campagnes suivies dont ${overview.scheduledCampaigns} encore planifiees.`
            : `${overview.totalCampaigns} campaigns tracked with ${overview.scheduledCampaigns} still scheduled.`,
          status: overview.scheduledCampaigns > 0 ? 'scheduled' : 'ready'
        },
        {
          id: 'campaign-delivery',
          name: isFrench ? 'Qualite de livraison campagne' : 'Campaign delivery quality',
          period: isFrench ? 'Snapshot actuel' : 'Current snapshot',
          summary: isFrench
            ? `${this.i18n.formatNumber(overview.deliveredMessages)} livres et ${this.i18n.formatNumber(overview.failedMessages)} en echec.`
            : `${this.i18n.formatNumber(overview.deliveredMessages)} delivered and ${this.i18n.formatNumber(overview.failedMessages)} failed.`,
          status: 'ready'
        },
        {
          id: 'campaign-automation',
          name: isFrench ? 'Ratio de support automation' : 'Automation support ratio',
          period: isFrench ? 'Snapshot actuel' : 'Current snapshot',
          summary: isFrench
            ? `${overview.activeAutomations} automations actives soutiennent l execution.`
            : `${overview.activeAutomations} active automations are backing campaign execution.`,
          status: 'ready'
        }
      ];
    }

    if (this.state().focus === 'audience') {
      return [
        {
          id: 'audience-capacity',
          name: isFrench ? 'Revue de capacite audience' : 'Audience capacity review',
          period: isFrench ? 'Snapshot actuel' : 'Current snapshot',
          summary: isFrench
            ? `${this.i18n.formatNumber(overview.totalContacts)} contacts regroupes dans ${overview.totalGroups} segments.`
            : `${this.i18n.formatNumber(overview.totalContacts)} contacts grouped into ${overview.totalGroups} segments.`,
          status: 'ready'
        },
        {
          id: 'audience-coverage',
          name: isFrench ? 'Couverture equipe' : 'Team coverage',
          period: isFrench ? 'Snapshot actuel' : 'Current snapshot',
          summary: isFrench
            ? `${overview.totalUsers} utilisateur(s) partagent la base audience actuelle.`
            : `${overview.totalUsers} platform user(s) share ownership of the current audience base.`,
          status: 'ready'
        },
        {
          id: 'audience-schedule',
          name: isFrench ? "Calendrier d'activation audience" : 'Audience activation schedule',
          period: isFrench ? 'Snapshot actuel' : 'Current snapshot',
          summary: isFrench
            ? `${overview.scheduledCampaigns} campagne(s) restent planifiee(s) pour une activation future.`
            : `${overview.scheduledCampaigns} campaign(s) remain scheduled for future audience activation.`,
          status: overview.scheduledCampaigns > 0 ? 'scheduled' : 'ready'
        }
      ];
    }

    return [
      {
        id: 'delivery-executive',
        name: isFrench ? 'Vue executive de delivrance' : 'Delivery executive overview',
        period: isFrench ? 'Snapshot actuel' : 'Current snapshot',
        summary: isFrench
          ? `${overview.deliveryRate.toFixed(1)}% de delivrabilite sur ${this.i18n.formatNumber(overview.totalMessages)} messages.`
          : `${overview.deliveryRate.toFixed(1)}% delivery rate across ${this.i18n.formatNumber(overview.totalMessages)} messages.`,
        status: 'ready'
      },
      {
        id: 'delivery-failure',
        name: isFrench ? 'Watchlist des echecs' : 'Failure watchlist',
        period: isFrench ? 'Snapshot actuel' : 'Current snapshot',
        summary: isFrench
          ? `${this.i18n.formatNumber(overview.failedMessages)} messages en echec necessitent une investigation.`
          : `${this.i18n.formatNumber(overview.failedMessages)} failed messages currently require investigation.`,
        status: overview.failedMessages > 0 ? 'scheduled' : 'ready'
      },
      {
        id: 'delivery-automation',
        name: isFrench ? 'Contribution automation' : 'Automation contribution',
        period: isFrench ? 'Snapshot actuel' : 'Current snapshot',
        summary: isFrench
          ? `${overview.activeAutomations} automations actives soutiennent le debit de livraison.`
          : `${overview.activeAutomations} active automations help sustain delivery throughput.`,
        status: 'ready'
      }
    ];
  });

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.state.update((state) => ({ ...state, loading: true, error: null }));

    try {
      const overview = await this.api.getOverview();
      this.state.update((state) => ({
        ...state,
        overview,
        loading: false
      }));
    } catch (error) {
      this.state.update((state) => ({
        ...state,
        loading: false,
        error: extractApiErrorMessage(
          error,
          this.i18n.language() === 'fr' ? 'Impossible de charger les analytics.' : 'Unable to load analytics.'
        )
      }));
    }
  }

  cycleFocus(): void {
    this.state.update((state) => ({
      ...state,
      focus: state.focus === 'delivery' ? 'campaigns' : state.focus === 'campaigns' ? 'audience' : 'delivery'
    }));
  }
}
