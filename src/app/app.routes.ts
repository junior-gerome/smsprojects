import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { AppShellComponent } from './layout/app-shell.component';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES)
  },
  {
    path: '',
    component: AppShellComponent,
    canActivateChild: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES) },
      { path: 'contacts', loadChildren: () => import('./features/contacts/contacts.routes').then((m) => m.CONTACTS_ROUTES) },
      { path: 'campaigns', loadChildren: () => import('./features/campaigns/campaigns.routes').then((m) => m.CAMPAIGNS_ROUTES) },
      { path: 'chat', loadChildren: () => import('./features/chat/chat.routes').then((m) => m.CHAT_ROUTES) },
      { path: 'templates', loadChildren: () => import('./features/templates/templates.routes').then((m) => m.TEMPLATES_ROUTES) },
      { path: 'analytics', loadChildren: () => import('./features/analytics/analytics.routes').then((m) => m.ANALYTICS_ROUTES) },
      { path: 'automation', loadChildren: () => import('./features/automation/automation.routes').then((m) => m.AUTOMATION_ROUTES) },
      { path: 'settings', loadChildren: () => import('./features/settings/settings.routes').then((m) => m.SETTINGS_ROUTES) }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
