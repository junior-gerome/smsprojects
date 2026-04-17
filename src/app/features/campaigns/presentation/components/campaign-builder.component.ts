import { Component, inject, input, output } from '@angular/core';
import { I18nService } from '../../../../core/services/i18n.service';
import { UiStatusChipComponent } from '../../../../shared/ui/status-chip.component';
import { AudienceOption, CampaignSummary } from '../../domain/campaigns.models';

@Component({
  selector: 'app-campaign-builder',
  standalone: true,
  imports: [UiStatusChipComponent],
  templateUrl: `./campaign-builder.component.html`
})
export class CampaignBuilderComponent {
  protected readonly i18n = inject(I18nService);
  readonly audiences = input.required<AudienceOption[]>();
  readonly selectedAudienceId = input.required<string>();
  readonly recentCampaigns = input.required<CampaignSummary[]>();
  readonly selectAudience = output<string>();

  audienceButtonClass(audienceId: string): string {
    const baseClass = 'w-full rounded-[1.5rem] p-4 text-left transition';
    return this.selectedAudienceId() === audienceId
      ? `${baseClass} bg-primary/10 ring-1 ring-primary/20`
      : `${baseClass} bg-surface-container-low`;
  }

  protected statusLabel(status: CampaignSummary['status']): string {
    if (status === 'completed') {
      return this.i18n.language() === 'fr' ? 'terminee' : 'completed';
    }
    if (status === 'scheduled') {
      return this.i18n.language() === 'fr' ? 'planifiee' : 'scheduled';
    }
    if (status === 'processing') {
      return this.i18n.language() === 'fr' ? 'traitement' : 'processing';
    }
    return this.i18n.language() === 'fr' ? 'echec' : 'failed';
  }

  statusTone(status: CampaignSummary['status']): 'success' | 'primary' | 'danger' | 'neutral' {
    if (status === 'completed') {
      return 'success';
    }
    if (status === 'scheduled' || status === 'processing') {
      return 'primary';
    }
    if (status === 'failed') {
      return 'danger';
    }

    return 'neutral';
  }
}
