import { Component, inject, input } from '@angular/core';
import { UiStatusChipComponent } from '../../../../shared/ui/status-chip.component';
import { I18nService } from '../../../../core/services/i18n.service';
import { ReportItem } from '../../domain/analytics.models';

@Component({
  selector: 'app-analytics-reports',
  standalone: true,
  imports: [UiStatusChipComponent],
  templateUrl: `./reports.component.html`
})
export class ReportsComponent {
  protected readonly i18n = inject(I18nService);
  readonly reports = input.required<ReportItem[]>();

  protected statusLabel(status: ReportItem['status']): string {
    if (status === 'ready') {
      return this.i18n.language() === 'fr' ? 'pret' : 'ready';
    }
    return this.i18n.language() === 'fr' ? 'planifie' : 'scheduled';
  }
}
