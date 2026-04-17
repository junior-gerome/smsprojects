import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../../core/services/i18n.service';
import { UiPageHeaderComponent } from '../../../shared/ui/page-header.component';
import { UiSurfaceCardComponent } from '../../../shared/ui/surface-card.component';
import { DashboardFacade } from '../application/dashboard.facade';
import { DashboardActivityFeedComponent } from './components/activity-feed.component';
import { DashboardStatsGridComponent } from './components/stats-grid.component';
import { DashboardVolumeChartsComponent } from './components/volume-charts.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    RouterLink,
    UiPageHeaderComponent,
    UiSurfaceCardComponent,
    DashboardStatsGridComponent,
    DashboardVolumeChartsComponent,
    DashboardActivityFeedComponent
  ],
  providers: [DashboardFacade],
  templateUrl: `./dashboard-page.component.html`
})
export class DashboardPageComponent {
  protected readonly facade = inject(DashboardFacade);
  protected readonly i18n = inject(I18nService);
}
