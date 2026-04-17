import { NgClass } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { I18nService } from '../../../../core/services/i18n.service';
import { DistributionItem, VolumePoint } from '../../domain/dashboard.models';

@Component({
  selector: "app-dashboard-volume-charts",
  standalone: true,
  imports: [NgClass],
  templateUrl: `./volume-charts.component.html`,
})
export class DashboardVolumeChartsComponent {
  protected readonly i18n = inject(I18nService);
  readonly volume = input.required<VolumePoint[]>();
  readonly distribution = input.required<DistributionItem[]>();

  dotClass(tone: DistributionItem["tone"]): string {
    switch (tone) {
      case "success":
        return "bg-secondary";
      case "danger":
        return "bg-tertiary";
      default:
        return "bg-primary";
    }
  }
}
