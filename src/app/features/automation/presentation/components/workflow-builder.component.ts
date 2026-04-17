import { Component, inject, input } from '@angular/core';
import { I18nService } from '../../../../core/services/i18n.service';
import { WorkflowStep } from '../../domain/automation.models';

@Component({
  selector: 'app-workflow-builder',
  standalone: true,
  templateUrl: `./workflow-builder.component.html`
})
export class WorkflowBuilderComponent {
  protected readonly i18n = inject(I18nService);
  readonly workflow = input.required<WorkflowStep[]>();

  protected stepTypeLabel(type: WorkflowStep['type']): string {
    switch (type) {
      case 'trigger':
        return this.i18n.language() === 'fr' ? 'declencheur' : 'trigger';
      case 'wait':
        return this.i18n.language() === 'fr' ? 'attente' : 'wait';
      case 'branch':
        return this.i18n.language() === 'fr' ? 'branche' : 'branch';
      default:
        return this.i18n.language() === 'fr' ? 'message' : 'message';
    }
  }

  icon(type: WorkflowStep['type']): string {
    switch (type) {
      case 'trigger':
        return 'flash_on';
      case 'wait':
        return 'schedule';
      case 'branch':
        return 'splitscreen';
      default:
        return 'sms';
    }
  }
}
