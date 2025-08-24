import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Language, Languages } from '../../../core/types';
import { isPlatformBrowser } from '@angular/common';

import { languages } from '../../../core/providers/languages';

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private languages: Languages[] = languages;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  checkLanguage(): Language {
    if (isPlatformBrowser(this.platformId)) {
      const consent: Language = JSON.parse(
        localStorage.getItem('_frvl_lng_dflt') || '{}'
      );

      if (Object.keys(consent).length > 0) {
        this.setDefaultLanguage(consent);
        return consent;
      }
    }

    return this.getDefaultLanguage();
  }

  getDefaultLanguage(): Language {
    const defaultLanguage =
      this.languages.find((language) => language.isDefault) || ({} as Language);
    return defaultLanguage;
  }

  setDefaultLanguage(language: Language) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('_frvl_lng_dflt', JSON.stringify(language));
    }
  }
}
