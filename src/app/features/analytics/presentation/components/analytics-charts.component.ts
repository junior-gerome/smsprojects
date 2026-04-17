import { Component, inject, input } from '@angular/core';
import { UiStatCardComponent } from '../../../../shared/ui/stat-card.component';
import { I18nService } from '../../../../core/services/i18n.service';
import { AnalyticsMetric, AnalyticsPoint } from '../../domain/analytics.models';

@Component({
  selector: 'app-analytics-charts',
  standalone: true,
  imports: [UiStatCardComponent],
  templateUrl: `./analytics-charts.component.html`
})
export class AnalyticsChartsComponent {
  protected readonly i18n = inject(I18nService);
  readonly metrics = input.required<AnalyticsMetric[]>();
  readonly performance = input.required<AnalyticsPoint[]>();
}
