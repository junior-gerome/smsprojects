import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { extractApiErrorMessage } from '../../../core/models/api.models';
import { I18nService } from '../../../core/services/i18n.service';
import { DashboardData } from '../domain/dashboard.models';
import { DashboardApiService } from '../infrastructure/dashboard-api.service';

@Injectable()
export class DashboardFacade {
  private readonly api = inject(DashboardApiService);
  private readonly i18n = inject(I18nService);
  private readonly state = signal<DashboardData & { loading: boolean; error: string | null }>({
    stats: [],
    volume: [],
    distribution: [],
    activity: [],
    loading: true,
    error: null
  });

  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly stats = computed(() => this.state().stats);
  readonly volume = computed(() => this.state().volume);
  readonly distribution = computed(() => this.state().distribution);
  readonly activity = computed(() => this.state().activity);

  constructor() {
    effect(() => {
      this.i18n.language();
      void this.load();
    }, { allowSignalWrites: true });
  }

  async load(): Promise<void> {
    this.state.update((state) => ({ ...state, loading: true, error: null }));

    try {
      const data = await this.api.getDashboardData();
      this.state.set({ ...data, loading: false, error: null });
    } catch (error) {
      this.state.update((state) => ({
        ...state,
        loading: false,
        error: extractApiErrorMessage(
          error,
          this.i18n.language() === 'fr' ? 'Impossible de charger le dashboard.' : 'Unable to load the dashboard.'
        )
      }));
    }
  }
}
