import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-page-header',
  standalone: true,
  templateUrl: `./page-header.component.html`
})
export class UiPageHeaderComponent {
  readonly eyebrow = input('');
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
