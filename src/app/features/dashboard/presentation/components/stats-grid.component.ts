import { Component, input } from '@angular/core';
import { DashboardStat } from '../../domain/dashboard.models';
import { UiStatCardComponent } from '../../../../shared/ui/stat-card.component';

@Component({
  selector: 'app-dashboard-stats-grid',
  standalone: true,
  imports: [UiStatCardComponent],
  templateUrl: `./stats-grid.component.html`,
})
export class DashboardStatsGridComponent {
  readonly stats = input.required<DashboardStat[]>();
}
