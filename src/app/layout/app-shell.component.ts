import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { APP_NAVIGATION, NavigationItem } from '../core/models/navigation.model';
import { APP_NOTIFICATIONS, NotificationItem } from '../core/models/notification.model';
import { I18nService } from '../core/services/i18n.service';
import { HeaderComponent } from './header.component';
import { NotificationsComponent } from './notifications.component';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, NotificationsComponent],
  template: `
    <div class="relative min-h-screen overflow-x-hidden">
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(57,44,193,0.18),transparent_28rem)]"></div>
      <div class="pointer-events-none absolute bottom-0 right-0 h-[32rem] w-[32rem] rounded-full bg-secondary/10 blur-3xl"></div>

      <div
        class="fixed inset-0 z-40 bg-background/70 transition lg:hidden"
        [class.pointer-events-none]="!mobileSidebarOpen()"
        [class.opacity-0]="!mobileSidebarOpen()"
        [class.opacity-100]="mobileSidebarOpen()"
        (click)="closeSidebar()"
      ></div>

      <app-sidebar
        [items]="navigation()"
        [mobileOpen]="mobileSidebarOpen()"
        (navigate)="closeSidebar()"
        (close)="closeSidebar()"
      />

      <div class="relative lg:pl-72">
        <app-header
          (menuToggle)="mobileSidebarOpen.set(true)"
          (notificationsToggle)="toggleNotifications()"
        />

        <main class="px-4 pb-10 pt-6 sm:px-6 lg:px-10">
          <router-outlet></router-outlet>
        </main>
      </div>

      <app-notifications
        [open]="notificationsOpen()"
        [items]="notifications()"
        (close)="notificationsOpen.set(false)"
      />
    </div>
  `
})
export class AppShellComponent {
  private readonly i18n = inject(I18nService);

  protected readonly navigation = computed<NavigationItem[]>(() =>
    APP_NAVIGATION.map((item) => ({
      route: item.route,
      icon: item.icon,
      label: this.i18n.t(item.labelKey),
      description: this.i18n.t(item.descriptionKey)
    }))
  );
  protected readonly notifications = computed<NotificationItem[]>(() =>
    APP_NOTIFICATIONS.map((item) => ({
      id: item.id,
      title: this.i18n.t(item.titleKey),
      body: this.i18n.t(item.bodyKey),
      time: item.time,
      tone: item.tone
    }))
  );
  protected readonly mobileSidebarOpen = signal(false);
  protected readonly notificationsOpen = signal(false);

  protected closeSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }

  protected toggleNotifications(): void {
    this.notificationsOpen.update((value) => !value);
  }
}
