import { Component, inject, input } from '@angular/core';
import { UiStatusChipComponent } from '../../../../shared/ui/status-chip.component';
import { I18nService } from '../../../../core/services/i18n.service';
import { AutomationInsight, Blueprint } from '../../domain/automation.models';

@Component({
  selector: 'app-automation-insights',
  standalone: true,
  imports: [UiStatusChipComponent],
  templateUrl: `./automation-insights.component.html`
})
export class AutomationInsightsComponent {
  protected readonly i18n = inject(I18nService);
  readonly blueprints = input.required<Blueprint[]>();
  readonly insights = input.required<AutomationInsight[]>();
}
