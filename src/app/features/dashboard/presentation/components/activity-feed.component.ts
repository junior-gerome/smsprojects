import { NgClass } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../../../core/services/i18n.service';
import { ActivityItem } from '../../domain/dashboard.models';

@Component({
  selector: "app-dashboard-activity-feed",
  standalone: true,
  imports: [NgClass, RouterLink],
  templateUrl: `./activity-feed.component.html`,
})
export class DashboardActivityFeedComponent {
  protected readonly i18n = inject(I18nService);
  readonly activity = input.required<ActivityItem[]>();

  iconClass(tone: ActivityItem["tone"]): string {
    switch (tone) {
      case "success":
        return "bg-secondary/10 text-secondary";
      case "danger":
        return "bg-tertiary/10 text-tertiary";
      default:
        return "bg-primary/10 text-primary";
    }
  }
}
