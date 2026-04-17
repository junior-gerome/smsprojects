import { Routes } from '@angular/router';
import { LoginPageComponent } from './presentation/login-page.component';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginPageComponent
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  }
];
