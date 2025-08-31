import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { I18nService } from '../../shared/components/common/i18n/i18n.service';
import { Language } from '../../core/types';

export interface LocaleLayoutInfo {
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
  cssClass: string;
  numberFormat: Intl.NumberFormatOptions;
  dateFormat: Intl.DateTimeFormatOptions;
  currency: string;
  fontFamily?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocaleLayoutService {
  private readonly RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];
  
  constructor(
    @Inject(LOCALE_ID) private localeId: string,
    private i18nService: I18nService
  ) {}

  getLocaleLayoutInfo(): LocaleLayoutInfo {
    const currentLanguage = this.i18nService.checkLanguage();
    const langCode = this.extractLanguageCode(this.localeId);
    
    return {
      isRTL: this.RTL_LANGUAGES.includes(langCode),
      direction: this.RTL_LANGUAGES.includes(langCode) ? 'rtl' : 'ltr',
      cssClass: this.generateCssClass(currentLanguage),
      numberFormat: this.getNumberFormat(currentLanguage),
      dateFormat: this.getDateFormat(currentLanguage),
      currency: currentLanguage.defaultCurrency || 'RON',
      fontFamily: this.getFontFamily(langCode)
    };
  }

  private extractLanguageCode(locale: string): string {
    return locale.split('-')[0];
  }

  private generateCssClass(language: Language): string {
    const baseClass = `locale-${language.key}`;
    const regionClass = `region-${language.locale.replace('-', '_').toLowerCase()}`;
    return `${baseClass} ${regionClass}`;
  }

  private getNumberFormat(language: Language): Intl.NumberFormatOptions {
    const baseFormat: Intl.NumberFormatOptions = {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    };

    // Language-specific number formatting
    switch (language.key) {
      case 'ro':
        return {
          ...baseFormat,
          useGrouping: true,
          // Romanian uses . for thousands and , for decimals
        };
      case 'en':
        return {
          ...baseFormat,
          useGrouping: true,
          // English uses , for thousands and . for decimals
        };
      default:
        return baseFormat;
    }
  }

  private getDateFormat(language: Language): Intl.DateTimeFormatOptions {
    const baseFormat: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };

    switch (language.key) {
      case 'ro':
        return {
          ...baseFormat,
          // Romanian date format: dd.mm.yyyy
          formatMatcher: 'best fit'
        };
      case 'en':
        return {
          ...baseFormat,
          // English date format: mm/dd/yyyy
          formatMatcher: 'best fit'
        };
      default:
        return baseFormat;
    }
  }

  private getFontFamily(langCode: string): string | undefined {
    const fontMap: Record<string, string> = {
      'ar': 'Noto Sans Arabic, sans-serif',
      'zh': 'Noto Sans CJK SC, sans-serif',
      'ja': 'Noto Sans CJK JP, sans-serif',
      'ko': 'Noto Sans CJK KR, sans-serif',
      'th': 'Noto Sans Thai, sans-serif',
      'hi': 'Noto Sans Devanagari, sans-serif'
    };

    return fontMap[langCode];
  }

  // Utility methods for components
  formatNumber(value: number): string {
    const currentLanguage = this.i18nService.checkLanguage();
    const options = this.getNumberFormat(currentLanguage);
    
    return new Intl.NumberFormat(this.localeId, options).format(value);
  }

  formatDate(date: Date): string {
    const currentLanguage = this.i18nService.checkLanguage();
    const options = this.getDateFormat(currentLanguage);
    
    return new Intl.DateTimeFormat(this.localeId, options).format(date);
  }

  formatCurrency(amount: number, currency?: string): string {
    const currentLanguage = this.i18nService.checkLanguage();
    const currencyCode = currency || currentLanguage.defaultCurrency || 'RON';
    
    return new Intl.NumberFormat(this.localeId, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  // Check if current locale matches Angular LOCALE_ID
  isLocaleConsistent(): boolean {
    const currentLanguage = this.i18nService.checkLanguage();
    return currentLanguage.locale === this.localeId || 
           currentLanguage.key === this.extractLanguageCode(this.localeId);
  }

  // Sync Angular LOCALE_ID with your i18n service
  syncLocales(): void {
    if (!this.isLocaleConsistent()) {
      // Log inconsistency for debugging
      console.warn(`Locale inconsistency detected:`, {
        angularLocale: this.localeId,
        i18nServiceLocale: this.i18nService.checkLanguage().locale
      });
    }
  }
}