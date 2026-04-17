import { Routes } from '@angular/router';
import { ContactsPageComponent } from './presentation/contacts-page.component';

export const CONTACTS_ROUTES: Routes = [
  {
    path: '',
    component: ContactsPageComponent,
    title: 'Contacts | Kinetic SMS'
  }
];
