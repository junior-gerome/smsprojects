import { Component, input, output } from '@angular/core';
import { MessageTemplate } from '../../domain/templates.models';
import { UiStatusChipComponent } from '../../../../shared/ui/status-chip.component';

@Component({
  selector: 'app-template-grid',
  standalone: true,
  imports: [UiStatusChipComponent],
  templateUrl: `./template-grid.component.html`
})
export class TemplateGridComponent {
  readonly templates = input.required<MessageTemplate[]>();
  readonly selectedId = input.required<string>();
  readonly select = output<string>();

  templateCardClass(templateId: string): string {
    const baseClass = 'section-card text-left transition';
    return this.selectedId() === templateId
      ? `${baseClass} bg-primary/10`
      : baseClass;
  }
}
