import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

export interface LocalizedRoute {
  path: string;
  translations: {
    en: string;
    ro: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class I18nRoutingService {
  private readonly routeTranslations: LocalizedRoute[] = [
    {
      path: '',
      translations: { en: '', ro: '' }
    },
    {
      path: 'search',
      translations: { en: 'search', ro: 'cautare' }
    },
    {
      path: 'login',
      translations: { en: 'login', ro: 'autentificare' }
    },
    {
      path: 'signup',
      translations: { en: 'signup', ro: 'inregistrare' }
    },
    {
      path: 'book-flight',
      translations: { en: 'book-flight', ro: 'rezervare-zbor' }
    },
    {
      path: 'profile',
      translations: { en: 'profile', ro: 'profil' }
    },
    {
      path: 'bookings',
      translations: { en: 'bookings', ro: 'rezervari' }
    },
    {
      path: 'complete-booking',
      translations: { en: 'complete-booking', ro: 'finalizare-rezervare' }
    },
    {
      path: 'admin',
      translations: { en: 'admin', ro: 'admin' }
    },
    {
      path: 'unauthorized',
      translations: { en: 'unauthorized', ro: 'neautorizat' }
    },
    {
      path: 'terms',
      translations: { en: 'terms', ro: 'termeni' }
    },
    {
      path: 'privacy',
      translations: { en: 'privacy', ro: 'confidentialitate' }
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * Get current language from URL or fallback to browser/default
   */
  getCurrentLanguageFromUrl(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return 'en';
    }

    const urlSegments = window.location.pathname.split('/').filter(segment => segment);
    const firstSegment = urlSegments[0];
    
    // Check if first segment is a language code
    if (firstSegment && this.isValidLanguageCode(firstSegment)) {
      return firstSegment;
    }

    // Fallback to browser language or default
    return this.translateService.getBrowserLang() || 'en';
  }

  /**
   * Navigate to a route with proper language prefix
   */
  navigateWithLanguage(path: string, language: string, params?: any): void {
    const translatedPath = this.translatePath(path, language);
    const fullPath = language === 'en' ? `/${translatedPath}` : `/${language}/${translatedPath}`;
    
    if (params) {
      this.router.navigate([fullPath], { queryParams: params });
    } else {
      this.router.navigate([fullPath]);
    }
  }

  /**
   * Switch language and update URL
   */
  switchLanguage(newLanguage: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const currentUrl = window.location.pathname;
    const currentLanguage = this.getCurrentLanguageFromUrl();
    const urlSegments = currentUrl.split('/').filter(segment => segment);
    
    // Remove current language prefix if exists
    if (this.isValidLanguageCode(urlSegments[0])) {
      urlSegments.shift();
    }

    // Translate current route segments
    const translatedSegments = this.translateUrlSegments(urlSegments, currentLanguage, newLanguage);
    
    // Build new URL
    let newUrl = '';
    if (newLanguage !== 'en') {
      newUrl = `/${newLanguage}`;
    }
    
    if (translatedSegments.length > 0) {
      newUrl += `/${translatedSegments.join('/')}`;
    }

    // Preserve query parameters
    const queryParams = window.location.search;
    const fullNewUrl = newUrl + queryParams;

    // Update translate service
    this.translateService.use(newLanguage);
    
    // Navigate to new URL
    window.location.href = fullNewUrl;
  }

  /**
   * Get localized path for a route
   */
  getLocalizedPath(path: string, language: string): string {
    const route = this.routeTranslations.find(r => r.path === path);
    if (route && route.translations[language as keyof typeof route.translations]) {
      return route.translations[language as keyof typeof route.translations];
    }
    return path;
  }

  /**
   * Get original path from localized path
   */
  getOriginalPath(localizedPath: string, language: string): string {
    const route = this.routeTranslations.find(r => 
      r.translations[language as keyof typeof r.translations] === localizedPath
    );
    return route ? route.path : localizedPath;
  }

  /**
   * Build URL with language prefix and translated paths
   */
  buildLocalizedUrl(path: string, language: string, params?: any): string {
    const translatedPath = this.translatePath(path, language);
    let url = language === 'en' ? '' : `/${language}`;
    
    if (translatedPath) {
      url += `/${translatedPath}`;
    }

    if (params) {
      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      url += `?${queryString}`;
    }

    return url || '/';
  }

  /**
   * Check if current URL needs language redirection
   */
  shouldRedirectForLanguage(): { shouldRedirect: boolean; redirectUrl?: string } {
    if (!isPlatformBrowser(this.platformId)) {
      return { shouldRedirect: false };
    }

    const currentPath = window.location.pathname;
    const segments = currentPath.split('/').filter(segment => segment);
    const firstSegment = segments[0];
    const currentLanguage = this.translateService.currentLang || 'en';

    // If no language in URL and not default language, redirect
    if (!this.isValidLanguageCode(firstSegment) && currentLanguage !== 'en') {
      const translatedPath = this.translateUrlSegments(segments, 'en', currentLanguage);
      const redirectUrl = `/${currentLanguage}/${translatedPath.join('/')}` + window.location.search;
      return { shouldRedirect: true, redirectUrl };
    }

    return { shouldRedirect: false };
  }

  private translatePath(path: string, language: string): string {
    // Remove leading slash
    const cleanPath = path.replace(/^\/+/, '');
    const segments = cleanPath.split('/');
    
    // Translate each segment
    return segments.map(segment => {
      const route = this.routeTranslations.find(r => r.path === segment);
      if (route && route.translations[language as keyof typeof route.translations]) {
        return route.translations[language as keyof typeof route.translations];
      }
      return segment;
    }).filter(segment => segment).join('/');
  }

  private translateUrlSegments(segments: string[], fromLanguage: string, toLanguage: string): string[] {
    return segments.map(segment => {
      // First, find the route by its translation in the current language
      const route = this.routeTranslations.find(r => 
        r.translations[fromLanguage as keyof typeof r.translations] === segment ||
        r.path === segment
      );
      
      if (route) {
        const translatedSegment = route.translations[toLanguage as keyof typeof route.translations];
        return translatedSegment || segment;
      }
      
      return segment;
    });
  }

  private isValidLanguageCode(code: string): boolean {
    return ['en', 'ro'].includes(code);
  }
}