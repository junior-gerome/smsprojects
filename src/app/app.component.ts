import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { I18nService } from './core/services/i18n.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {
  private readonly themeService = inject(ThemeService);
  private readonly i18nService = inject(I18nService);

  protected readonly themeInitialized = this.themeService.theme;
  protected readonly languageInitialized = this.i18nService.language;
}
