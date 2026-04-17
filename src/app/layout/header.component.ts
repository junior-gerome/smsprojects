import { Component, ElementRef, HostListener, computed, inject, output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { GlobalSearchService, SearchResultItem } from '../core/services/global-search.service';
import { I18nService } from '../core/services/i18n.service';
import { ThemeService } from '../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: `./header.component.html`,
})
export class HeaderComponent {
  readonly authService = inject(AuthService);
  readonly i18n = inject(I18nService);
  readonly themeService = inject(ThemeService);
  readonly searchService = inject(GlobalSearchService);
  readonly router = inject(Router);
  readonly elementRef = inject(ElementRef<HTMLElement>);
  readonly menuToggle = output<void>();
  readonly notificationsToggle = output<void>();

  readonly themeIcon = computed(() => (this.themeService.isDark() ? 'light_mode' : 'dark_mode'));
  readonly themeLabel = computed(() =>
    this.themeService.isDark() ? this.i18n.t('header.theme.light') : this.i18n.t('header.theme.dark')
  );
  readonly userBadge = computed(() => this.authService.user()?.fullName ?? this.i18n.t('header.securedSession'));
  readonly searchOpen = computed(
    () => this.searchService.open() && (this.searchService.loading() || this.searchService.query().trim().length > 0)
  );

  @HostListener('document:click', ['$event'])
  protected handleDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.searchService.closePanel();
    }
  }

  protected onSearchInput(query: string): void {
    this.searchService.updateQuery(query);
  }

  protected resultKindLabel(kind: string): string {
    return this.i18n.t(`header.search.kind.${kind}`);
  }

  protected openSearchResult(result: SearchResultItem): void {
    void this.router.navigateByUrl(result.route);
    this.searchService.clear();
  }

  protected logout(): void {
    this.searchService.clear();
    void this.authService.logout();
  }
}
