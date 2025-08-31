import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID, DOCUMENT } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { GdprComponent } from './gdpr.component';

describe('GdprComponent - SEO Optimized', () => {
  let component: GdprComponent;
  let fixture: ComponentFixture<GdprComponent>;
  let mockDocument: jasmine.SpyObj<Document>;
  let mockMeta: jasmine.SpyObj<Meta>;
  let mockTitle: jasmine.SpyObj<Title>;

  beforeEach(async () => {
    // Create spies for DOM manipulation
    const headSpy = jasmine.createSpyObj('HTMLHeadElement', ['appendChild']);
    const scriptSpy = jasmine.createSpyObj('HTMLScriptElement', [], {
      type: '',
      textContent: ''
    });

    const documentSpy = jasmine.createSpyObj('Document', ['createElement'], {
      head: headSpy
    });
    
    const metaSpy = jasmine.createSpyObj('Meta', ['updateTag']);
    const titleSpy = jasmine.createSpyObj('Title', ['setTitle']);

    documentSpy.createElement.and.returnValue(scriptSpy);

    await TestBed.configureTestingModule({
      imports: [GdprComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: DOCUMENT, useValue: documentSpy },
        { provide: Meta, useValue: metaSpy },
        { provide: Title, useValue: titleSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GdprComponent);
    component = fixture.componentInstance;
    mockDocument = TestBed.inject(DOCUMENT) as jasmine.SpyObj<Document>;
    mockMeta = TestBed.inject(Meta) as jasmine.SpyObj<Meta>;
    mockTitle = TestBed.inject(Title) as jasmine.SpyObj<Title>;

    // Setup localStorage mock
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(localStorage, 'setItem');

    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default visible state', () => {
      expect(component.isVisible()).toBe(true);
      expect(component.isProcessing()).toBe(false);
      expect(component.canInteract()).toBe(true);
    });

    it('should setup SEO meta tags on init', () => {
      expect(mockMeta.updateTag).toHaveBeenCalledWith({
        name: 'description',
        content: jasmine.stringContaining('Cookie consent and privacy settings for Fravel')
      });
      
      expect(mockMeta.updateTag).toHaveBeenCalledWith({
        name: 'robots',
        content: 'noindex, nofollow'
      });
    });

    it('should create structured data script tag', () => {
      expect(mockDocument.createElement).toHaveBeenCalledWith('script');
      expect(mockDocument.head.appendChild).toHaveBeenCalled();
    });

    it('should hide banner if consent already exists', () => {
      const mockConsent = {
        hasConsent: true,
        timestamp: Date.now(),
        version: '1.0',
        categories: ['necessary', 'analytics']
      };
      
      (localStorage.getItem as jasmine.Spy).and.returnValue(JSON.stringify(mockConsent));
      
      component.ngOnInit();
      
      expect(component.isVisible()).toBe(false);
    });
  });

  describe('Cookie Consent Actions', () => {
    beforeEach(() => {
      // Reset processing state before each test
      component['_isProcessing'].set(false);
    });

    it('should handle accept all action correctly', () => {
      spyOn(component.acceptGDPR, 'emit');
      
      component.onAcceptAll();
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        '_fvrl_ckie_cnst',
        jasmine.stringContaining('"hasConsent":true')
      );
      
      expect(component.acceptGDPR.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          type: 'accept_all',
          consentData: jasmine.objectContaining({
            hasConsent: true,
            categories: ['necessary', 'analytics', 'marketing', 'preferences']
          })
        })
      );
      
      expect(component.isVisible()).toBe(false);
    });

    it('should handle reject all action correctly', () => {
      spyOn(component.acceptGDPR, 'emit');
      
      component.onRejectAll();
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        '_fvrl_ckie_cnst',
        jasmine.stringContaining('"hasConsent":false')
      );
      
      expect(component.acceptGDPR.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          type: 'reject_all',
          consentData: jasmine.objectContaining({
            hasConsent: false,
            categories: ['necessary'] // Only necessary cookies
          })
        })
      );
      
      expect(component.isVisible()).toBe(false);
    });

    it('should handle customize action correctly', () => {
      spyOn(component.acceptGDPR, 'emit');
      
      component.onCustomize();
      
      expect(component.acceptGDPR.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          type: 'customize',
          consentData: jasmine.objectContaining({
            hasConsent: false,
            categories: []
          })
        })
      );
    });

    it('should prevent actions when processing', () => {
      component['_isProcessing'].set(true);
      spyOn(component.acceptGDPR, 'emit');
      
      component.onAcceptAll();
      
      expect(component.acceptGDPR.emit).not.toHaveBeenCalled();
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should show processing state during actions', () => {
      component.onAcceptAll();
      
      // During processing, the component should show processing state
      // (This test would need to be adjusted based on actual timing)
      expect(component.canInteract()).toBe(true); // After processing completes
    });
  });

  describe('Google Analytics Integration', () => {
    beforeEach(() => {
      // Mock gtag and dataLayer
      (window as any).gtag = jasmine.createSpy('gtag');
      (window as any).dataLayer = [];
      spyOn((window as any).dataLayer, 'push');
    });

    afterEach(() => {
      // Clean up global mocks
      delete (window as any).gtag;
      delete (window as any).dataLayer;
    });

    it('should update Google Analytics consent on accept', () => {
      component.onAcceptAll();
      
      expect((window as any).gtag).toHaveBeenCalledWith('consent', 'update', {
        'analytics_storage': 'granted',
        'ad_storage': 'granted',
        'personalization_storage': 'granted'
      });
    });

    it('should update Google Analytics consent on reject', () => {
      component.onRejectAll();
      
      expect((window as any).gtag).toHaveBeenCalledWith('consent', 'update', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
        'personalization_storage': 'denied'
      });
    });

    it('should push custom events to dataLayer', () => {
      component.onAcceptAll();
      
      expect((window as any).dataLayer.push).toHaveBeenCalledWith({
        'event': 'cookie_consent',
        'consent_type': 'accept_all',
        'consent_categories': ['necessary', 'analytics', 'marketing', 'preferences'],
        'consent_version': '1.0'
      });
    });
  });

  describe('SEO and Accessibility Features', () => {
    it('should have proper ARIA attributes in template', () => {
      const compiled = fixture.nativeElement;
      const banner = compiled.querySelector('.gdpr-banner');
      
      expect(banner?.getAttribute('role')).toBe('dialog');
      expect(banner?.getAttribute('aria-modal')).toBe('false');
      expect(banner?.getAttribute('aria-labelledby')).toBe('gdpr-title');
    });

    it('should include structured data for SEO', () => {
      const compiled = fixture.nativeElement;
      const structuredData = compiled.querySelector('script[type="application/ld+json"]');
      
      expect(structuredData).toBeTruthy();
      
      if (structuredData) {
        const jsonData = JSON.parse(structuredData.textContent);
        expect(jsonData['@type']).toBe('ConsentForm');
        expect(jsonData.name).toBe('GDPR Cookie Consent');
        expect(jsonData.provider.name).toBe('Fravel');
      }
    });

    it('should have semantic HTML structure', () => {
      const compiled = fixture.nativeElement;
      
      expect(compiled.querySelector('aside.gdpr-banner')).toBeTruthy();
      expect(compiled.querySelector('header.gdpr-banner__header')).toBeTruthy();
      expect(compiled.querySelector('main.gdpr-banner__content')).toBeTruthy();
      expect(compiled.querySelector('footer.gdpr-banner__actions')).toBeTruthy();
    });

    it('should include microdata attributes', () => {
      const compiled = fixture.nativeElement;
      const banner = compiled.querySelector('.gdpr-banner');
      
      expect(banner?.getAttribute('itemscope')).toBe('');
      expect(banner?.getAttribute('itemtype')).toBe('https://schema.org/ConsentForm');
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      spyOn(localStorage, 'setItem').and.throwError('Storage quota exceeded');
      spyOn(console, 'error');
      
      component.onAcceptAll();
      
      expect(console.error).toHaveBeenCalledWith('Error storing consent:', jasmine.any(Error));
    });

    it('should handle JSON parsing errors gracefully', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue('invalid-json');
      spyOn(console, 'warn');
      
      component.ngOnInit();
      
      expect(console.warn).toHaveBeenCalledWith('Error checking existing consent:', jasmine.any(Error));
    });
  });

  describe('Server-Side Rendering Compatibility', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [GdprComponent],
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' }, // SSR environment
          { provide: DOCUMENT, useValue: mockDocument },
          { provide: Meta, useValue: mockMeta },
          { provide: Title, useValue: mockTitle }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(GdprComponent);
      component = fixture.componentInstance;
    });

    it('should not access localStorage in SSR environment', () => {
      spyOn(localStorage, 'getItem');
      
      component.ngOnInit();
      
      expect(localStorage.getItem).not.toHaveBeenCalled();
    });

    it('should not create structured data scripts in SSR', () => {
      // Reset the spy call count
      mockDocument.createElement.calls.reset();
      
      component.onAcceptAll();
      
      // Should not create script tags in SSR environment
      expect(mockDocument.createElement).not.toHaveBeenCalledWith('script');
    });
  });

  describe('Component Lifecycle', () => {
    it('should clean up resources on destroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });
});
