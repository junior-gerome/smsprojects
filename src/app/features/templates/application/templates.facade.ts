import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { extractApiErrorMessage } from '../../../core/models/api.models';
import { I18nService } from '../../../core/services/i18n.service';
import { MessageTemplate, TemplateDraft } from '../domain/templates.models';
import { TemplatesApiService } from '../infrastructure/templates-api.service';

@Injectable()
export class TemplatesFacade {
  private readonly api = inject(TemplatesApiService);
  private readonly i18n = inject(I18nService);
  private readonly state = signal<{
    templates: MessageTemplate[];
    selectedTemplateId: string;
    loading: boolean;
    saving: boolean;
    formOpen: boolean;
    error: string | null;
    successMessage: string | null;
  }>({
    templates: [],
    selectedTemplateId: '',
    loading: true,
    saving: false,
    formOpen: false,
    error: null,
    successMessage: null
  });

  readonly templates = computed(() => this.state().templates);
  readonly loading = computed(() => this.state().loading);
  readonly saving = computed(() => this.state().saving);
  readonly formOpen = computed(() => this.state().formOpen);
  readonly error = computed(() => this.state().error);
  readonly successMessage = computed(() => this.state().successMessage);
  readonly selectedTemplate = computed(() =>
    this.state().templates.find((template) => template.id === this.state().selectedTemplateId)
  );

  constructor() {
    effect(() => {
      this.i18n.language();
      void this.load();
    }, { allowSignalWrites: true });
  }

  async load(): Promise<void> {
    this.state.update((state) => ({ ...state, loading: true, error: null, successMessage: null }));

    try {
      const templates = await this.api.getTemplates();
      this.state.set({
        templates,
        selectedTemplateId: templates[0]?.id ?? '',
        loading: false,
        saving: false,
        formOpen: false,
        error: null,
        successMessage: null
      });
    } catch (error) {
      this.state.update((state) => ({
        ...state,
        loading: false,
        error: extractApiErrorMessage(
          error,
          this.i18n.language() === 'fr' ? 'Impossible de charger les templates.' : 'Unable to load templates.'
        )
      }));
    }
  }

  selectTemplate(id: string): void {
    this.state.update((state) => ({ ...state, selectedTemplateId: id }));
  }

  openForm(): void {
    this.state.update((state) => ({ ...state, formOpen: true, successMessage: null }));
  }

  closeForm(): void {
    this.state.update((state) => ({ ...state, formOpen: false }));
  }

  async saveTemplate(draft: TemplateDraft): Promise<void> {
    this.state.update((state) => ({ ...state, saving: true, error: null, successMessage: null }));

    try {
      const template = await this.api.createTemplate(draft);
      this.state.update((state) => ({
        ...state,
        templates: [template, ...state.templates],
        selectedTemplateId: template.id,
        saving: false,
        formOpen: false,
        successMessage:
          this.i18n.language() === 'fr' ? 'Template cree avec succes.' : 'Template created successfully.'
      }));
    } catch (error) {
      this.state.update((state) => ({
        ...state,
        saving: false,
        error: extractApiErrorMessage(
          error,
          this.i18n.language() === 'fr' ? 'Impossible de creer le template.' : 'Unable to create the template.'
        )
      }));
    }
  }
}
