import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';

type StatTone = 'primary' | 'success' | 'danger' | 'neutral';
type Trend = 'up' | 'down' | 'flat';

@Component({
  selector: 'ui-stat-card',
  standalone: true,
  imports: [NgClass],
  templateUrl: `./stat-card.component.html`
})
export class UiStatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly icon = input.required<string>();
  readonly helper = input('');
  readonly change = input('');
  readonly tone = input<StatTone>('neutral');
  readonly trend = input<Trend>('flat');

  readonly iconClass = computed(() => {
    switch (this.tone()) {
      case 'primary':
        return 'bg-primary/10 text-primary';
      case 'success':
        return 'bg-secondary/10 text-secondary';
      case 'danger':
        return 'bg-tertiary/10 text-tertiary';
      default:
        return 'bg-surface-container-high text-on-surface';
    }
  });

  readonly changeClass = computed(() => {
    switch (this.trend()) {
      case 'up':
        return 'text-secondary';
      case 'down':
        return 'text-tertiary';
      default:
        return 'text-on-surface-variant';
    }
  });

  readonly trendIcon = computed(() => {
    switch (this.trend()) {
      case 'up':
        return 'trending_up';
      case 'down':
        return 'trending_down';
      default:
        return 'trending_flat';
    }
  });
}
