import { Routes } from '@angular/router';
import { CampaignsPageComponent } from './presentation/campaigns-page.component';

export const CAMPAIGNS_ROUTES: Routes = [
  {
    path: '',
    component: CampaignsPageComponent,
    title: 'Campaigns | Kinetic SMS'
  }
];
