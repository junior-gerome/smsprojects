import { Component, inject, input } from '@angular/core';
import { UiStatusChipComponent } from '../../../../shared/ui/status-chip.component';
import { I18nService } from '../../../../core/services/i18n.service';
import { MessageTemplate } from '../../domain/templates.models';

@Component({
  selector: 'app-template-preview',
  standalone: true,
  imports: [UiStatusChipComponent],
  templateUrl: `./template-preview.component.html`
})
export class TemplatePreviewComponent {
  protected readonly i18n = inject(I18nService);
  readonly template = input<MessageTemplate | undefined>(undefined);
}
