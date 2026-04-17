import { NgClass } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { NotificationItem } from '../core/models/notification.model';
import { I18nService } from '../core/services/i18n.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [NgClass],
  templateUrl: `./notifications.component.html`
})
export class NotificationsComponent {
  readonly i18n = inject(I18nService);
  readonly open = input(false);
  readonly items = input.required<NotificationItem[]>();
  readonly close = output<void>();

  toneClass(tone: NotificationItem['tone']): string {
    switch (tone) {
      case 'success':
        return 'bg-secondary/10 text-secondary';
      case 'warning':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-primary/10 text-primary';
    }
  }

  toneIcon(tone: NotificationItem['tone']): string {
    switch (tone) {
      case 'success':
        return 'task_alt';
      case 'warning':
        return 'warning';
      default:
        return 'notifications_active';
    }
  }
}
