import { Component, inject } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { UiPageHeaderComponent } from '../../../shared/ui/page-header.component';
import { AnalyticsFacade } from '../application/analytics.facade';
import { AnalyticsChartsComponent } from './components/analytics-charts.component';
import { ReportsComponent } from './components/reports.component';

@Component({
  selector: 'app-analytics-page',
  standalone: true,
  imports: [UiPageHeaderComponent, AnalyticsChartsComponent, ReportsComponent],
  providers: [AnalyticsFacade],
  templateUrl: `./analytics-page.component.html`
})
export class AnalyticsPageComponent {
  protected readonly facade = inject(AnalyticsFacade);
  protected readonly i18n = inject(I18nService);
}
