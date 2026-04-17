import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-surface-card',
  standalone: true,
  templateUrl: `./surface-card.component.html`
})
export class UiSurfaceCardComponent {
  readonly eyebrow = input('');
  readonly title = input('');
  readonly description = input('');
  readonly compact = input(false);
}
