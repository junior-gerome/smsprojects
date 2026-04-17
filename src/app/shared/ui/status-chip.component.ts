import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';

type ChipTone = 'primary' | 'success' | 'danger' | 'neutral' | 'warning';

@Component({
  selector: 'ui-status-chip',
  standalone: true,
  imports: [NgClass],
  templateUrl: `./status-chip.component.html`
})
export class UiStatusChipComponent {
  readonly label = input.required<string>();
  readonly tone = input<ChipTone>('neutral');
  readonly dot = input(true);

  readonly chipClass = computed(() => {
    switch (this.tone()) {
      case 'primary':
        return 'bg-primary/10 text-primary ring-1 ring-primary/20';
      case 'success':
        return 'bg-secondary/15 text-secondary ring-1 ring-secondary/20';
      case 'danger':
        return 'bg-tertiary/15 text-tertiary ring-1 ring-tertiary/20';
      case 'warning':
        return 'bg-warning/15 text-warning ring-1 ring-warning/20';
      default:
        return 'bg-surface-container-high text-on-surface-variant ring-1 ring-white/5';
    }
  });
}
