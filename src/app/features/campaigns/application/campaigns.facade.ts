import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { extractApiErrorMessage } from '../../../core/models/api.models';
import { I18nService } from '../../../core/services/i18n.service';
import { CampaignState } from '../domain/campaigns.models';
import { CampaignsApiService } from '../infrastructure/campaigns-api.service';

@Injectable()
export class CampaignsFacade {
  private readonly api = inject(CampaignsApiService);
  private readonly i18n = inject(I18nService);
  private readonly state = signal<CampaignState>({
    name: '',
    message: '',
    audiences: [],
    selectedAudienceId: '',
    scheduleMode: 'now',
    scheduleAt: '',
    shortenLinks: true,
    recentCampaigns: [],
    variables: [],
    templates: [],
    selectedTemplateId: '',
    loading: true,
    saving: false,
    error: null,
    successMessage: null
  });

  readonly campaign = computed(() => this.state());
  readonly selectedAudience = computed(() =>
    this.state().audiences.find((audience) => audience.id === this.state().selectedAudienceId)
  );
  readonly selectedTemplate = computed(() =>
    this.state().templates.find((template) => template.id === this.state().selectedTemplateId) ?? null
  );
  readonly characters = computed(() => this.state().message.length);
  readonly segments = computed(() => (this.characters() > 160 ? Math.ceil(this.characters() / 153) : 1));
  readonly validationMessage = computed(() => {
    const snapshot = this.state();
    const selectedAudience = snapshot.audiences.find((audience) => audience.id === snapshot.selectedAudienceId);
    const selectedAudienceRecipients = Number(selectedAudience?.recipients ?? '0');

    if (!snapshot.audiences.length) {
      return this.i18n.language() === 'fr'
        ? 'Aucune audience disponible. Creez d abord un groupe dans Contacts.'
        : 'No audience is available yet. Create a group first in Contacts.';
    }

    if (!snapshot.name.trim()) {
      return this.i18n.language() === 'fr' ? 'Le nom de campagne est obligatoire.' : 'Campaign name is required.';
    }

    if (!snapshot.message.trim()) {
      return this.i18n.language() === 'fr' ? 'Le contenu SMS est obligatoire.' : 'SMS content is required.';
    }

    if (!snapshot.selectedAudienceId) {
      return this.i18n.language() === 'fr'
        ? 'Selectionnez au moins une audience.'
        : 'Select at least one audience.';
    }

    if (selectedAudience && (!Number.isFinite(selectedAudienceRecipients) || selectedAudienceRecipients <= 0)) {
      return this.i18n.language() === 'fr'
        ? 'L audience selectionnee est vide. Ajoutez des contacts avant de lancer la campagne.'
        : 'The selected audience is empty. Add contacts before launching the campaign.';
    }

    if (snapshot.scheduleMode === 'later' && !snapshot.scheduleAt) {
      return this.i18n.language() === 'fr'
        ? 'Choisissez une date de planification.'
        : 'Choose a schedule date.';
    }

    return null;
  });
  readonly canLaunch = computed(() => !this.validationMessage() && !this.state().saving && !this.state().loading);

  constructor() {
    effect(() => {
      this.i18n.language();
      void this.load();
    }, { allowSignalWrites: true });
  }

  async load(): Promise<void> {
    this.state.update((state) => ({ ...state, loading: true, error: null, successMessage: null }));

    try {
      this.state.set(await this.api.getCampaignState());
    } catch (error) {
      this.state.update((state) => ({
        ...state,
        loading: false,
        error: extractApiErrorMessage(
          error,
          this.i18n.language() === 'fr'
            ? 'Impossible de charger le builder de campagne.'
            : 'Unable to load the campaign builder.'
        )
      }));
    }
  }

  updateName(name: string): void {
    this.state.update((state) => ({ ...state, name, successMessage: null }));
  }

  updateMessage(message: string): void {
    this.state.update((state) => ({ ...state, message, successMessage: null }));
  }

  insertVariable(variable: string): void {
    this.state.update((state) => ({
      ...state,
      message: state.message ? `${state.message} ${variable}` : variable,
      successMessage: null
    }));
  }

  selectAudience(audienceId: string): void {
    this.state.update((state) => ({ ...state, selectedAudienceId: audienceId, successMessage: null }));
  }

  setScheduleMode(scheduleMode: CampaignState['scheduleMode']): void {
    this.state.update((state) => ({
      ...state,
      scheduleMode,
      scheduleAt: scheduleMode === 'now' ? '' : state.scheduleAt,
      successMessage: null
    }));
  }

  setScheduleAt(scheduleAt: string): void {
    this.state.update((state) => ({ ...state, scheduleAt, successMessage: null }));
  }

  selectTemplate(templateId: string): void {
    this.state.update((state) => {
      const template = state.templates.find((item) => item.id === templateId);
      return {
        ...state,
        selectedTemplateId: templateId,
        message: template?.content ?? state.message,
        successMessage: null
      };
    });
  }

  toggleShortenLinks(): void {
    this.state.update((state) => ({ ...state, shortenLinks: !state.shortenLinks }));
  }

  async launchCampaign(): Promise<void> {
    const snapshot = this.state();
    const validationMessage = this.validationMessage();

    if (validationMessage) {
      this.state.update((state) => ({
        ...state,
        error: validationMessage
      }));
      return;
    }

    this.state.update((state) => ({ ...state, saving: true, error: null, successMessage: null }));

    try {
      const selectedAudience = snapshot.audiences.find((audience) => audience.id === snapshot.selectedAudienceId);

      await this.api.createCampaign({
        name: snapshot.name.trim(),
        content: snapshot.message.trim(),
        templateId: snapshot.selectedTemplateId || null,
        scheduleAt: snapshot.scheduleMode === 'later' ? snapshot.scheduleAt : null,
        targetContactIds: selectedAudience?.targetContactIds ?? [],
        targetGroupIds: selectedAudience?.targetGroupIds ?? [],
        sendNow: snapshot.scheduleMode === 'now'
      });

      await this.load();
      this.state.update((state) => ({
        ...state,
        successMessage:
          snapshot.scheduleMode === 'now'
            ? this.i18n.language() === 'fr'
              ? 'Campagne placee en file chez le provider SMS.'
              : 'Campaign queued with the SMS provider.'
            : this.i18n.language() === 'fr'
              ? 'Campagne planifiee avec succes.'
              : 'Campaign scheduled successfully.'
      }));
    } catch (error) {
      this.state.update((state) => ({
        ...state,
        saving: false,
        error: extractApiErrorMessage(
          error,
          this.i18n.language() === 'fr' ? 'Impossible de creer la campagne.' : 'Unable to create the campaign.'
        )
      }));
    }
  }
}
