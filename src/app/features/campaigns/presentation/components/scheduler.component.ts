import { Component, inject, input, output } from '@angular/core';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-campaign-scheduler',
  standalone: true,
  templateUrl: `./scheduler.component.html`
})
export class SchedulerComponent {
  protected readonly i18n = inject(I18nService);
  readonly mode = input.required<'now' | 'later'>();
  readonly scheduledAt = input.required<string>();
  readonly summary = input.required<string>();
  readonly modeChange = output<'now' | 'later'>();
  readonly scheduledAtChange = output<string>();
}
