import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, isDevMode, signal } from '@angular/core';
import enTranslations from '../../../assets/i18n/en.json';
import frTranslations from '../../../assets/i18n/fr.json';

export type AppLanguage = 'fr' | 'en';

type TranslationDictionary = Record<AppLanguage, Record<string, string>>;

const TRANSLATIONS: TranslationDictionary = {
  fr: flattenTranslations(frTranslations),
  en: flattenTranslations(enTranslations),
};

function flattenTranslations(source: Record<string, unknown>, prefix = ''): Record<string, string> {
  return Object.entries(source).reduce<Record<string, string>>((translations, [key, value]) => {
    const translationKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      translations[translationKey] = String(value);
      return translations;
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(translations, flattenTranslations(value as Record<string, unknown>, translationKey));
    }

    return translations;
  }, {});
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'kinetic-language';
  private readonly missingKeys = new Set<string>();
  readonly language = signal<AppLanguage>(this.getInitialLanguage());
  readonly locale = computed(() => (this.language() === 'fr' ? 'fr-FR' : 'en-US'));
  readonly currentLabel = computed(() => this.t('header.language.current'));
  readonly nextLabel = computed(() => this.languageLabel(this.language() === 'fr' ? 'en' : 'fr'));

  constructor() {
    effect(() => {
      const language = this.language();
      globalThis.localStorage?.setItem(this.storageKey, language);
      this.document.documentElement.lang = language;
      this.document.documentElement.setAttribute('translate', 'no');
      this.document.documentElement.classList.add('notranslate');
      this.document.body?.setAttribute('translate', 'no');
      this.document.body?.classList.add('notranslate');
    });
  }

  toggleLanguage(): void {
    this.language.update((current) => (current === 'fr' ? 'en' : 'fr'));
  }

  t(key: string, params?: Record<string, string | number>): string {
    const dictionary = TRANSLATIONS[this.language()];
    const fallbackValue = TRANSLATIONS.fr[key];
    let value = dictionary[key] ?? fallbackValue;

    if (!value) {
      if (isDevMode() && !this.missingKeys.has(key)) {
        this.missingKeys.add(key);
        console.warn(`[i18n] Missing translation key: ${key}`);
      }
      value = this.humanizeTranslationKey(key);
    }

    if (!params) {
      return value;
    }

    Object.entries(params).forEach(([paramKey, paramValue]) => {
      value = value.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
    });

    return value;
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat(this.locale()).format(value);
  }

  formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.locale(), options).format(new Date(value));
  }

  formatDateTime(value: string | Date): string {
    return this.formatDate(value, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatTime(value: string | Date): string {
    return this.formatDate(value, {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatCodeLabel(value: string): string {
    const normalized = value
      .trim()
      .replace(/^ROLE[_-]?/i, '')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ');

    if (!normalized) {
      return '';
    }

    return normalized
      .split(' ')
      .filter(Boolean)
      .map(
        (segment) =>
          segment.charAt(0).toLocaleUpperCase(this.locale()) + segment.slice(1).toLocaleLowerCase(this.locale()),
      )
      .join(' ');
  }

  private getInitialLanguage(): AppLanguage {
    const saved = globalThis.localStorage?.getItem(this.storageKey);
    if (saved === 'fr' || saved === 'en') {
      return saved;
    }

    const browserLanguage = globalThis.navigator?.language?.toLowerCase() ?? 'fr';
    return browserLanguage.startsWith('en') ? 'en' : 'fr';
  }

  private languageLabel(language: AppLanguage): string {
    return language === 'fr' ? 'Francais' : 'English';
  }

  private humanizeTranslationKey(key: string): string {
    return this.formatCodeLabel(key.split('.').pop() ?? key) || key;
  }
}
