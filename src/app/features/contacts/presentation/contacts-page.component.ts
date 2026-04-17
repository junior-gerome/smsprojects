import { Component, inject } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { UiPageHeaderComponent } from '../../../shared/ui/page-header.component';
import { UiSurfaceCardComponent } from '../../../shared/ui/surface-card.component';
import { ContactsFacade } from '../application/contacts.facade';
import { ContactFormComponent } from './components/contact-form.component';
import { ContactGroupFormComponent } from './components/contact-group-form.component';
import { ContactsListComponent } from './components/contacts-list.component';
import { ImportModalComponent } from './components/import-modal.component';

@Component({
  selector: 'app-contacts-page',
  standalone: true,
  imports: [
    UiPageHeaderComponent,
    UiSurfaceCardComponent,
    ContactsListComponent,
    ContactFormComponent,
    ContactGroupFormComponent,
    ImportModalComponent
  ],
  providers: [ContactsFacade],
  templateUrl: `./contacts-page.component.html`
})
export class ContactsPageComponent {
  protected readonly facade = inject(ContactsFacade);
  protected readonly i18n = inject(I18nService);

  protected reload(): void {
    void this.facade.load(0);
  }

  protected topGroupName(): string {
    return this.facade.topGroup()?.name ?? this.i18n.t('contacts.noGroup');
  }

  protected contactsSummary(): string {
    return this.i18n.language() === 'fr'
      ? `${this.facade.totalElements()} contact(s) synchronise(s) et ${this.facade.groups().length} groupe(s) actif(s).`
      : `${this.facade.totalElements()} synchronized contact(s) and ${this.facade.groups().length} active group(s).`;
  }
}
