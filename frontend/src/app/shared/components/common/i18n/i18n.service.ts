import { Injectable, Inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { Language, Languages } from '../../../../core/types';
import { languages } from '../../../../core/providers/languages';

interface I18nState {
  currentLanguage: Language;
  isInitialized: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private readonly STORAGE_KEY = '_frvl_lng_dflt';
  private readonly availableLanguages: Languages[] = languages;
  
  // Internal state
  private readonly _state = signal<I18nState>({
    currentLanguage: {} as Language,
    isInitialized: false,
    error: null
  });
  
  // Public computed signals
  readonly currentLanguage = computed(() => this._state().currentLanguage);
  readonly isInitialized = computed(() => this._state().isInitialized);
  readonly error = computed(() => this._state().error);
  readonly hasValidLanguage = computed(() => 
    Object.keys(this._state().currentLanguage).length > 0
  );

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.initialize();
  }

  // Public methods
  checkLanguage(): Language {
    const storedLanguage = this.getStoredLanguage();
    
    if (this.isValidLanguage(storedLanguage)) {
      this.updateCurrentLanguage(storedLanguage, null);
      return storedLanguage;
    }

    const defaultLanguage = this.getDefaultLanguage();
    this.updateCurrentLanguage(defaultLanguage, null);
    return defaultLanguage;
  }

  getDefaultLanguage(): Language {
    try {
      const defaultLanguage = this.availableLanguages.find(
        language => language.isDefault
      );

      if (!defaultLanguage) {
        throw new Error('No default language configured');
      }

      return defaultLanguage as Language;
    } catch (error) {
      this.updateCurrentLanguage({} as Language, 'Failed to get default language');
      return {} as Language;
    }
  }

  setDefaultLanguage(language: Language): boolean {
    try {
      if (!this.isValidLanguage(language)) {
        throw new Error('Invalid language object provided');
      }

      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(language));
      }

      this.updateCurrentLanguage(language, null);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set language';
      this.updateCurrentLanguage(this._state().currentLanguage, errorMessage);
      return false;
    }
  }

  getAvailableLanguages(): Languages[] {
    return [...this.availableLanguages];
  }

  isLanguageSupported(languageKey: string): boolean {
    return this.availableLanguages.some(lang => lang.key === languageKey);
  }

  clearStoredLanguage(): void {
    try {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem(this.STORAGE_KEY);
      }
      
      const defaultLanguage = this.getDefaultLanguage();
      this.updateCurrentLanguage(defaultLanguage, null);
    } catch (error) {
      this.updateCurrentLanguage(this._state().currentLanguage, 'Failed to clear stored language');
    }
  }

  // Private methods
  private initialize(): void {
    try {
      const language = this.checkLanguage();
      this._state.update(state => ({
        ...state,
        isInitialized: true,
        currentLanguage: language,
        error: null
      }));
    } catch (error) {
      this._state.update(state => ({
        ...state,
        isInitialized: true,
        error: 'Failed to initialize i18n service'
      }));
    }
  }

  private getStoredLanguage(): Language {
    try {
      if (!isPlatformBrowser(this.platformId)) {
        return {} as Language;
      }

      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return {} as Language;
      }

      const parsed = JSON.parse(stored);
      return this.isValidLanguage(parsed) ? parsed : {} as Language;
    } catch (error) {
      // Invalid JSON or storage error
      return {} as Language;
    }
  }

  private updateCurrentLanguage(language: Language, error: string | null): void {
    this._state.update(state => ({
      ...state,
      currentLanguage: language,
      error
    }));
  }

  private isValidLanguage(language: any): language is Language {
    return language && 
           typeof language === 'object' &&
           typeof language.key === 'string' &&
           language.key.length > 0 &&
           typeof language.language === 'string' &&
           language.language.length > 0;
  }
}
