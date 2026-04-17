import { DatePipe } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { UiStatusChipComponent } from '../../../../shared/ui/status-chip.component';
import { I18nService } from '../../../../core/services/i18n.service';
import { Contact } from '../../domain/contacts.models';

@Component({
  selector: 'app-contacts-list',
  standalone: true,
  imports: [UiStatusChipComponent, DatePipe],
  templateUrl: `./contact-list.component.html`
})
export class ContactsListComponent {
  protected readonly i18n = inject(I18nService);
  readonly contacts = input.required<Contact[]>();
  readonly selectedIds = input.required<string[]>();
  readonly activeFilters = input.required<string[]>();
  readonly toggle = output<string>();

  protected initials(fullName: string): string {
    return fullName
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  protected formatContactDate(createdAt: string): string {
    return this.i18n.formatDate(createdAt, {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  protected statusLabel(status: Contact['status']): string {
    if (status === 'ACTIVE') {
      return this.i18n.language() === 'fr' ? 'actif' : 'active';
    }
    if (status === 'BOUNCED') {
      return this.i18n.language() === 'fr' ? 'bounce' : 'bounced';
    }
    return this.i18n.language() === 'fr' ? 'nouveau' : 'new';
  }

  tone(status: Contact['status']): 'success' | 'danger' | 'neutral' {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'BOUNCED':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  tagTone(tag: string): 'primary' | 'success' | 'danger' | 'neutral' {
    if (tag.toLowerCase() === 'vip') {
      return 'success';
    }
    if (tag.toLowerCase().includes('bounce')) {
      return 'danger';
    }
    if (tag.toLowerCase().includes('enterprise')) {
      return 'primary';
    }

    return 'neutral';
  }
}
