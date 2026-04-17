import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { extractApiErrorMessage } from '../../../core/models/api.models';
import { I18nService } from '../../../core/services/i18n.service';
import { AutomationInsight, Blueprint, WorkflowStep } from '../domain/automation.models';
import { AutomationApiService } from '../infrastructure/automation-api.service';

interface AutomationState {
  workflow: WorkflowStep[];
  blueprints: Blueprint[];
  insights: AutomationInsight[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
  nextPresetIndex: number;
}

interface WorkflowPreset {
  name: string;
  triggerType: string;
  actionType: string;
  scheduleExpression: string;
}

@Injectable()
export class AutomationFacade {
  private readonly api = inject(AutomationApiService);
  private readonly i18n = inject(I18nService);
  private readonly presets: WorkflowPreset[] = [
    {
      name: 'Delivery follow-up',
      triggerType: 'order_delivered',
      actionType: 'send_sms_review_request',
      scheduleExpression: 'PT6H'
    },
    {
      name: 'Appointment reminder',
      triggerType: 'appointment_upcoming',
      actionType: 'send_sms_reminder',
      scheduleExpression: 'PT24H'
    },
    {
      name: 'Win-back touchpoint',
      triggerType: 'customer_inactive',
      actionType: 'send_sms_offer',
      scheduleExpression: 'P7D'
    }
  ];
  private readonly state = signal<AutomationState>({
    workflow: [],
    blueprints: [],
    insights: [],
    loading: true,
    saving: false,
    error: null,
    successMessage: null,
    nextPresetIndex: 0
  });

  readonly workflow = computed(() => this.state().workflow);
  readonly blueprints = computed(() => this.state().blueprints);
  readonly insights = computed(() => this.state().insights);
  readonly loading = computed(() => this.state().loading);
  readonly saving = computed(() => this.state().saving);
  readonly error = computed(() => this.state().error);
  readonly successMessage = computed(() => this.state().successMessage);

  constructor() {
    effect(() => {
      this.i18n.language();
      void this.load();
    }, { allowSignalWrites: true });
  }

  async load(): Promise<void> {
    this.state.update((state) => ({ ...state, loading: true, error: null }));

    try {
      const [workflow, blueprints, insights] = await Promise.all([
        this.api.getWorkflow(),
        this.api.getBlueprints(),
        this.api.getInsights()
      ]);
      this.state.update((state) => ({
        ...state,
        workflow,
        blueprints,
        insights,
        loading: false
      }));
    } catch (error) {
      this.state.update((state) => ({
        ...state,
        loading: false,
        error: extractApiErrorMessage(
          error,
          this.i18n.language() === 'fr'
            ? "Impossible de charger les donnees d'automation."
            : 'Unable to load automation data.'
        )
      }));
    }
  }

  async createStarterWorkflow(): Promise<void> {
    const preset = this.presets[this.state().nextPresetIndex % this.presets.length];

    this.state.update((state) => ({
      ...state,
      saving: true,
      error: null,
      successMessage: null
    }));

    try {
      const localizedPresetName =
        preset.triggerType === 'order_delivered'
          ? this.i18n.language() === 'fr'
            ? 'Relance post livraison'
            : 'Delivery follow-up'
          : preset.triggerType === 'appointment_upcoming'
            ? this.i18n.language() === 'fr'
              ? 'Rappel de rendez-vous'
              : 'Appointment reminder'
            : this.i18n.language() === 'fr'
              ? 'Scenario de reactivation'
              : 'Win-back touchpoint';

      await this.api.createWorkflow({
        ...preset,
        name: localizedPresetName,
        active: true
      });

      await this.load();
      this.state.update((state) => ({
        ...state,
        saving: false,
        nextPresetIndex: (state.nextPresetIndex + 1) % this.presets.length,
        successMessage:
          this.i18n.language() === 'fr'
            ? `Workflow ${localizedPresetName} cree avec succes.`
            : `${localizedPresetName} workflow created successfully.`
      }));
    } catch (error) {
      this.state.update((state) => ({
        ...state,
        saving: false,
        error: extractApiErrorMessage(
          error,
          this.i18n.language() === 'fr' ? 'Impossible de creer le workflow.' : 'Unable to create the workflow.'
        )
      }));
    }
  }
}
