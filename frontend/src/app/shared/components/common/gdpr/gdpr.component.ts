import {
  Component,
  EventEmitter,
  Inject,
  Output,
  PLATFORM_ID,
  OnInit,
  OnDestroy,
  signal,
  computed,
  effect,
  LOCALE_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';

// Import i18n service for dynamic translations
import { SharedService } from '../../../shared.service';
import { Language } from '../../../../core/types';

// Global analytics declarations
declare global {
  function gtag(...args: any[]): void;
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Types for better type safety
interface CookieConsentData {
  hasConsent: boolean;
  timestamp: number;
  version: string;
  categories: string[];
}

interface GdprEvent {
  type: 'accept_all' | 'reject_all' | 'customize';
  timestamp: number;
  consentData: CookieConsentData;
}

// Translation interface
interface GdprTranslations {
  title: string;
  description: {
    primary: string;
    secondary: string;
  };
  cookieCategories: {
    title: string;
    categories: {
      essential: { name: string; description: string; };
      analytics: { name: string; description: string; };
      marketing: { name: string; description: string; };
      preferences: { name: string; description: string; };
    };
  };
  legal: {
    text: string;
    privacyPolicy: string;
    cookiePolicy: string;
  };
  buttons: {
    acceptAll: string;
    rejectAll: string;
    customize: string;
    processing: string;
  };
  footer: {
    text: string;
  };
  aria: {
    acceptAllDesc: string;
    rejectAllDesc: string;
    customizeDesc: string;
    processing: string;
  };
  meta: {
    description: string;
    ogTitle: string;
    ogDescription: string;
  };
}

@Component({
  standalone: true,
  selector: 'app-gdpr',
  templateUrl: './gdpr.component.html',
  styleUrls: ['./gdpr.component.scss'],
  imports: [CommonModule],
})
export class GdprComponent implements OnInit, OnDestroy {
  @Output('acceptGDPR') acceptGDPR: EventEmitter<GdprEvent> = new EventEmitter<GdprEvent>();
  
  // Reactive state management
  private readonly _isVisible = signal(true);
  private readonly _isProcessing = signal(false);
  private readonly _currentLanguage = signal<Language>({} as Language);
  
  // Computed properties
  readonly isVisible = computed(() => this._isVisible());
  readonly isProcessing = computed(() => this._isProcessing());
  readonly canInteract = computed(() => !this._isProcessing());
  readonly currentLanguage = computed(() => this._currentLanguage());
  readonly isRTL = computed(() => ['ar', 'he', 'fa'].includes(this._currentLanguage().key || ''));
  
  // i18n computed properties
  readonly translations = computed(() => this.getTranslations(this._currentLanguage().key || this.localeId));
  
  // Constants for SEO and compliance
  private readonly STORAGE_KEY = '_fvrl_ckie_cnst';
  private readonly CONSENT_VERSION = '1.0';
  private readonly COOKIE_CATEGORIES = ['necessary', 'analytics', 'marketing', 'preferences'];
  
  private readonly destroy$ = new Subject<void>();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    @Inject(LOCALE_ID) private localeId: string,
    private meta: Meta,
    private title: Title,
    private sharedService: SharedService
  ) {
    // Initialize current language from shared service
    const flightSearch = this.sharedService.flightSearch();
    if (flightSearch.defaultLanguage && Object.keys(flightSearch.defaultLanguage).length > 0) {
      this._currentLanguage.set(flightSearch.defaultLanguage);
    }

    // Setup reactive effects for i18n and SEO
    if (isPlatformBrowser(this.platformId)) {
      // Watch for language changes
      effect(() => {
        const flightSearch = this.sharedService.flightSearch();
        if (flightSearch.defaultLanguage && Object.keys(flightSearch.defaultLanguage).length > 0) {
          this._currentLanguage.set(flightSearch.defaultLanguage);
          this.setupI18nMetaTags();
        }
      });

      // Setup SEO optimization effect
      effect(() => {
        this.setupSEOOptimization();
      });
    }
  }

  ngOnInit(): void {
    this.checkExistingConsent();
    this.setupStructuredData();
    this.setupI18nMetaTags();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Public methods
  onAcceptAll(): void {
    if (!this.canInteract()) return;
    
    this._isProcessing.set(true);
    
    const consentData: CookieConsentData = {
      hasConsent: true,
      timestamp: Date.now(),
      version: this.CONSENT_VERSION,
      categories: [...this.COOKIE_CATEGORIES]
    };

    if (isPlatformBrowser(this.platformId)) {
      this.storeConsent(consentData);
      this.trackConsentEvent('accept_all', consentData);
    }

    const event: GdprEvent = {
      type: 'accept_all',
      timestamp: Date.now(),
      consentData
    };

    this.acceptGDPR.emit(event);
    this._isVisible.set(false);
    this._isProcessing.set(false);
  }

  onRejectAll(): void {
    if (!this.canInteract()) return;
    
    this._isProcessing.set(true);
    
    const consentData: CookieConsentData = {
      hasConsent: false,
      timestamp: Date.now(),
      version: this.CONSENT_VERSION,
      categories: ['necessary'] // Only necessary cookies
    };

    if (isPlatformBrowser(this.platformId)) {
      this.storeConsent(consentData);
      this.trackConsentEvent('reject_all', consentData);
    }

    const event: GdprEvent = {
      type: 'reject_all',
      timestamp: Date.now(),
      consentData
    };

    this.acceptGDPR.emit(event);
    this._isVisible.set(false);
    this._isProcessing.set(false);
  }

  onCustomize(): void {
    // This would open a detailed cookie settings modal
    const event: GdprEvent = {
      type: 'customize',
      timestamp: Date.now(),
      consentData: {
        hasConsent: false,
        timestamp: Date.now(),
        version: this.CONSENT_VERSION,
        categories: []
      }
    };
    
    this.acceptGDPR.emit(event);
  }

  // SEO and metadata methods
  private setupSEOOptimization(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Add microdata for cookie consent
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Cookie Consent - Fravel',
      'description': 'Cookie consent and privacy preferences for Fravel travel booking platform',
      'provider': {
        '@type': 'Organization',
        'name': 'Fravel',
        'url': window.location.origin
      },
      'hasPart': {
        '@type': 'WebPageElement',
        'name': 'Cookie Consent Banner',
        'description': 'GDPR compliant cookie consent interface'
      }
    });
    
    this.document.head.appendChild(script);
  }

  private setupI18nMetaTags(): void {
    const t = this.translations();
    
    this.meta.updateTag({ 
      name: 'description', 
      content: t.meta.description
    });
    
    this.meta.updateTag({ 
      name: 'robots', 
      content: 'noindex, nofollow' 
    });
    
    this.meta.updateTag({ 
      property: 'og:title', 
      content: t.meta.ogTitle
    });
    
    this.meta.updateTag({ 
      property: 'og:description', 
      content: t.meta.ogDescription
    });
    
    // Add language and direction meta tags
    this.meta.updateTag({
      name: 'language',
      content: this._currentLanguage().key || this.localeId
    });
    
    this.meta.updateTag({
      name: 'direction',
      content: this.isRTL() ? 'rtl' : 'ltr'
    });
    
    // Update HTML lang attribute
    if (isPlatformBrowser(this.platformId)) {
      this.document.documentElement.lang = this._currentLanguage().locale || this.localeId;
      this.document.documentElement.dir = this.isRTL() ? 'rtl' : 'ltr';
    }
  }

  private setupStructuredData(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const t = this.translations();
    const currentLang = this._currentLanguage();
    
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'ConsentForm',
      'name': t.title,
      'description': t.description.primary,
      'url': window.location.href,
      'provider': {
        '@type': 'Organization',
        'name': 'Fravel',
        'legalName': 'Fravel Travel Services'
      },
      'dateCreated': new Date().toISOString(),
      'inLanguage': currentLang.locale || this.localeId,
      'isAccessibleForFree': true,
      'applicationCategory': 'Privacy',
      'operatingSystem': 'Any',
      'browserRequirements': 'Modern web browser with JavaScript enabled'
    };

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    this.document.head.appendChild(script);
  }

  // Private helper methods
  private checkExistingConsent(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const consentData = JSON.parse(stored) as CookieConsentData;
        if (consentData.hasConsent) {
          this._isVisible.set(false);
        }
      }
    } catch (error) {
      console.warn('Error checking existing consent:', error);
    }
  }

  private storeConsent(consentData: CookieConsentData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(consentData));
    } catch (error) {
      console.error('Error storing consent:', error);
    }
  }

  private trackConsentEvent(type: string, consentData: CookieConsentData): void {
    // Track consent for analytics (Google Analytics, etc.)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': consentData.categories.includes('analytics') ? 'granted' : 'denied',
        'ad_storage': consentData.categories.includes('marketing') ? 'granted' : 'denied',
        'personalization_storage': consentData.categories.includes('preferences') ? 'granted' : 'denied'
      });
    }

    // Custom event tracking
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        'event': 'cookie_consent',
        'consent_type': type,
        'consent_categories': consentData.categories,
        'consent_version': consentData.version
      });
    }
  }

  // i18n translation methods
  private getTranslations(locale: string): GdprTranslations {
    const translations: { [key: string]: GdprTranslations } = {
      'ro': {
        title: 'Preferințe Cookie - Continuă către Fravel',
        description: {
          primary: 'Înainte de a continua către Fravel, avem nevoie de acordul dumneavoastră pentru a vă îmbunătăți experiența cu conținut și servicii personalizate.',
          secondary: 'Prin selectarea opțiunii "Acceptă Toate", sunteți de acord să stocăm cookie-uri pe dispozitivul dumneavoastră. Acest lucru ne ajută să îmbunătățim navigarea pe site, să analizăm tiparul de utilizare și să optimizăm strategiile noastre de marketing în conformitate deplină cu reglementările GDPR.'
        },
        cookieCategories: {
          title: 'Vezi Categoriile de Cookie-uri',
          categories: {
            essential: {
              name: 'Cookie-uri Esențiale',
              description: 'Necesare pentru funcționarea de bază a site-ului și securitatea acestuia.'
            },
            analytics: {
              name: 'Cookie-uri de Analiză',
              description: 'Ne ajută să înțelegem cum utilizează vizitatorii site-ul nostru pentru a îmbunătăți performanța.'
            },
            marketing: {
              name: 'Cookie-uri de Marketing',
              description: 'Folosite pentru a furniza reclame relevante și a măsura eficacitatea campaniilor.'
            },
            preferences: {
              name: 'Cookie-uri de Preferințe',
              description: 'Reține setările dumneavoastră și personalizează experiența.'
            }
          }
        },
        legal: {
          text: 'Pentru informații detaliate despre practicile noastre de prelucrare a datelor, vă rugăm să consultați',
          privacyPolicy: 'Politica de Confidențialitate',
          cookiePolicy: 'Politica de Cookie-uri'
        },
        buttons: {
          acceptAll: 'Acceptă Toate Cookie-urile',
          rejectAll: 'Respinge Toate',
          customize: 'Personalizează Preferințele',
          processing: 'Se procesează...'
        },
        footer: {
          text: 'Puteți modifica preferințele oricând în setările contului sau contactând echipa noastră de suport.'
        },
        aria: {
          acceptAllDesc: 'Acceptă toate cookie-urile incluzând cookie-uri de analiză și marketing',
          rejectAllDesc: 'Respinge toate cookie-urile opționale, păstrând doar cookie-urile esențiale',
          customizeDesc: 'Deschide preferințele detaliate pentru cookie-uri pentru a alege categorii specifice',
          processing: 'Se procesează preferințele pentru cookie-uri...'
        },
        meta: {
          description: 'Consimțământ pentru cookie-uri și setări de confidențialitate pentru Fravel. Gestionați preferințele pentru cookie-uri în conformitate cu reglementările GDPR.',
          ogTitle: 'Preferințe Cookie - Fravel',
          ogDescription: 'Gestionați preferințele pentru cookie-uri și confidențialitate pentru cea mai bună experiență de rezervare călătorii.'
        }
      },
      'en': {
        title: 'Cookie Preferences - Continue to Fravel',
        description: {
          primary: 'Before continuing to Fravel, we need your consent to enhance your experience with personalized content and services.',
          secondary: 'By selecting "Accept All", you agree to store cookies on your device. This helps us improve site navigation, analyze usage patterns, and optimize our marketing strategies in full compliance with GDPR regulations.'
        },
        cookieCategories: {
          title: 'View Cookie Categories',
          categories: {
            essential: {
              name: 'Essential Cookies',
              description: 'Required for basic site functionality and security.'
            },
            analytics: {
              name: 'Analytics Cookies',
              description: 'Help us understand how visitors use our site to improve performance.'
            },
            marketing: {
              name: 'Marketing Cookies',
              description: 'Used to provide relevant ads and measure campaign effectiveness.'
            },
            preferences: {
              name: 'Preference Cookies',
              description: 'Remember your settings and personalize your experience.'
            }
          }
        },
        legal: {
          text: 'For detailed information about our data processing practices, please review our',
          privacyPolicy: 'Privacy Policy',
          cookiePolicy: 'Cookie Policy'
        },
        buttons: {
          acceptAll: 'Accept All Cookies',
          rejectAll: 'Reject All',
          customize: 'Customize Preferences',
          processing: 'Processing...'
        },
        footer: {
          text: 'You can change your preferences anytime in your account settings or by contacting our support team.'
        },
        aria: {
          acceptAllDesc: 'Accept all cookies including analytics and marketing cookies',
          rejectAllDesc: 'Reject all optional cookies, keeping only essential cookies',
          customizeDesc: 'Open detailed cookie preferences to choose specific categories',
          processing: 'Processing your cookie preferences...'
        },
        meta: {
          description: 'Cookie consent and privacy settings for Fravel. Manage your cookie preferences in compliance with GDPR regulations.',
          ogTitle: 'Cookie Preferences - Fravel',
          ogDescription: 'Manage your cookie and privacy preferences for the best travel booking experience.'
        }
      }
    };

    // Return translation for the requested locale or fallback to English
    return translations[locale] || translations['en'];
  }
}
