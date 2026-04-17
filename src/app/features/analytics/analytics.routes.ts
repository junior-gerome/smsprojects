import { Routes } from '@angular/router';
import { AnalyticsPageComponent } from './presentation/analytics-page.component';

export const ANALYTICS_ROUTES: Routes = [
  {
    path: '',
    component: AnalyticsPageComponent,
    title: 'Analytics | Kinetic SMS'
  }
];
