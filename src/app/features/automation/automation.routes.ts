import { Routes } from '@angular/router';
import { AutomationPageComponent } from './presentation/automation-page.component';

export const AUTOMATION_ROUTES: Routes = [
  {
    path: '',
    component: AutomationPageComponent,
    title: 'Automation | Kinetic SMS'
  }
];
