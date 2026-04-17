import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavigationItem } from '../core/models/navigation.model';
import { AuthService } from '../core/services/auth.service';
import { I18nService } from '../core/services/i18n.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: `./sidebar.component.html`,
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  readonly i18n = inject(I18nService);
  readonly items = input.required<NavigationItem[]>();
  readonly mobileOpen = input(false);
  readonly navigate = output<void>();
  readonly close = output<void>();
  protected readonly userName = computed(() => this.authService.user()?.fullName ?? this.i18n.t('sidebar.defaultUser'));
  protected readonly primaryRole = computed(() => this.authService.user()?.roles[0]?.replace('ROLE_', '') ?? this.i18n.t('sidebar.defaultRole'));
  protected readonly userInitials = computed(() =>
    this.userName()
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
  );

  protected logout(): void {
    void this.authService.logout();
  }

  protected primaryRoleLabel(): string {
    const role = this.primaryRole();
    switch (role) {
      case 'ADMIN':
        return this.i18n.language() === 'fr' ? 'Administrateur' : 'Administrator';
      case 'MANAGER':
        return this.i18n.language() === 'fr' ? 'Manager' : 'Manager';
      case 'ANALYST':
        return this.i18n.language() === 'fr' ? 'Analyste' : 'Analyst';
      case 'OPERATOR':
        return this.i18n.language() === 'fr' ? 'Operateur' : 'Operator';
      default:
        return this.i18n.formatCodeLabel(role);
    }
  }
}
