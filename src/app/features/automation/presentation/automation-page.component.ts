import { Component, inject } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { UiPageHeaderComponent } from '../../../shared/ui/page-header.component';
import { AutomationFacade } from '../application/automation.facade';
import { AutomationInsightsComponent } from './components/automation-insights.component';
import { WorkflowBuilderComponent } from './components/workflow-builder.component';

@Component({
  selector: 'app-automation-page',
  standalone: true,
  imports: [UiPageHeaderComponent, WorkflowBuilderComponent, AutomationInsightsComponent],
  providers: [AutomationFacade],
  templateUrl: `./automation-page.component.html`
})
export class AutomationPageComponent {
  protected readonly facade = inject(AutomationFacade);
  protected readonly i18n = inject(I18nService);
}
