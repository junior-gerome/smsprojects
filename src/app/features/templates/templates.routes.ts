import { Routes } from '@angular/router';
import { TemplatesPageComponent } from './presentation/templates-page.component';

export const TEMPLATES_ROUTES: Routes = [
  {
    path: '',
    component: TemplatesPageComponent,
    title: 'Templates | Kinetic SMS'
  }
];
