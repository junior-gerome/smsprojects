import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../../core/services/i18n.service';
import { UiPageHeaderComponent } from '../../../shared/ui/page-header.component';
import { CampaignsFacade } from '../application/campaigns.facade';
import { CampaignBuilderComponent } from './components/campaign-builder.component';
import { SchedulerComponent } from './components/scheduler.component';
import { SmsEditorComponent } from './components/sms-editor.component';

@Component({
  selector: 'app-campaigns-page',
  standalone: true,
  imports: [UiPageHeaderComponent, SmsEditorComponent, CampaignBuilderComponent, SchedulerComponent, RouterLink],
  providers: [CampaignsFacade],
  templateUrl: `./campaigns-page.component.html`
})
export class CampaignsPageComponent {
  protected readonly facade = inject(CampaignsFacade);
  protected readonly i18n = inject(I18nService);
  protected readonly campaign = this.facade.campaign;
  protected readonly previewFooter = computed(
    () =>
      this.i18n.language() === 'fr'
        ? `${this.facade.selectedAudience()?.recipients ?? '0'} contacts - ${this.facade.segments()} segment(s)`
        : `${this.facade.selectedAudience()?.recipients ?? '0'} contacts - ${this.facade.segments()} segment(s)`
  );
  protected readonly scheduleSummary = computed(() =>
    this.campaign().scheduleMode === 'now'
      ? this.i18n.t('campaigns.summary.now')
      : this.campaign().scheduleAt
        ? this.i18n.t('campaigns.summary.later', {
            date: this.i18n.formatDateTime(this.campaign().scheduleAt.replace(' ', 'T'))
          })
        : this.i18n.t('campaigns.summary.empty')
  );

  protected processingLabel(): string {
    return this.i18n.t('campaigns.processing');
  }

  protected reload(): void {
    void this.facade.load();
  }
}
