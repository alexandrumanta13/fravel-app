import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, forkJoin, of, catchError } from 'rxjs';
import { map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { I18nService } from '../../shared/components/common/i18n/i18n.service';
import { RoutesService } from '../../core/services';
import { SharedService } from '../../shared/shared.service';
import { LayoutLoggerService } from '../services/layout-logger.service';
import { LayoutStrategyService } from '../services/layout-strategy.service';

import { Layout } from '../layout.types';
import { 
  LayoutResolverData, 
  ConsentStatus, 
  BreakpointResolution, 
  LanguageResolution 
} from '../types/layout-resolver.types';

@Injectable({
  providedIn: 'root'
})
export class LayoutResolver {
  private readonly CONSENT_KEY = '_fvrl_ckie_cnst';
  private readonly CLIENT_LAYOUTS: Layout[] = ['mobile', 'desktop'];
  
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private breakpointObserver: BreakpointObserver,
    private i18nService: I18nService,
    private sharedService: SharedService,
    private routesService: RoutesService,
    private logger: LayoutLoggerService,
    private layoutStrategy: LayoutStrategyService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<LayoutResolverData> {
    const startTime = performance.now();
    
    return forkJoin({
      consent: this.resolveConsent(),
      breakpoint: this.resolveBreakpoint(route.data),
      language: this.resolveLanguage(state.url)
    }).pipe(
      map(({ consent, breakpoint, language }) => {
        const resolverData: LayoutResolverData = {
          gdpr: !consent.hasConsent,
          resolution: breakpoint.layout,
          defaultLanguage: language.key,
          locale: language.locale,
          timestamp: Date.now()
        };

        const endTime = performance.now();
        this.logger.debug(`Layout resolved in ${(endTime - startTime).toFixed(2)}ms`, {
          data: resolverData,
          route: route.routeConfig?.path,
          breakpoint: breakpoint,
          language: language
        });

        return resolverData;
      }),
      catchError((error) => {
        this.logger.error('Layout resolution failed', { error, route: route.routeConfig?.path });
        return of(this.getDefaultResolverData());
      })
    );
  }

  private resolveConsent(): Observable<ConsentStatus> {
    if (!isPlatformBrowser(this.platformId)) {
      return of({ 
        hasConsent: false, 
        consentKey: this.CONSENT_KEY 
      });
    }

    try {
      const consentValue = localStorage.getItem(this.CONSENT_KEY);
      const lastCheckedStr = localStorage.getItem(`${this.CONSENT_KEY}_timestamp`);
      
      return of({
        hasConsent: !!consentValue,
        consentKey: this.CONSENT_KEY,
        lastChecked: lastCheckedStr ? new Date(lastCheckedStr) : undefined
      });
    } catch (error) {
      this.logger.warn('Could not access localStorage for consent', { error });
      return of({ 
        hasConsent: false, 
        consentKey: this.CONSENT_KEY 
      });
    }
  }

  private resolveBreakpoint(routeData: any): Observable<BreakpointResolution> {
    const requestedLayout = routeData?.layout as Layout;
    
    // If specific layout is requested and it's not client-dependent, return it
    if (requestedLayout && !this.CLIENT_LAYOUTS.includes(requestedLayout)) {
      return of({
        layout: requestedLayout,
        isMobile: false,
        isTablet: false,
        isDesktop: requestedLayout === 'desktop'
      });
    }

    // Determine layout based on breakpoint
    const breakpointMatches = {
      isXSmall: this.breakpointObserver.isMatched(Breakpoints.XSmall),
      isSmall: this.breakpointObserver.isMatched(Breakpoints.Small),
      isMedium: this.breakpointObserver.isMatched(Breakpoints.Medium),
      isLarge: this.breakpointObserver.isMatched(Breakpoints.Large),
      isXLarge: this.breakpointObserver.isMatched(Breakpoints.XLarge)
    };

    let resolvedLayout: Layout;
    let screenInfo: Partial<BreakpointResolution> = {};

    if (breakpointMatches.isXSmall || breakpointMatches.isSmall) {
      resolvedLayout = 'mobile';
      screenInfo = { isMobile: true, isTablet: false, isDesktop: false };
    } else if (breakpointMatches.isMedium) {
      resolvedLayout = 'desktop'; // Tablet uses desktop layout
      screenInfo = { isMobile: false, isTablet: true, isDesktop: false };
    } else {
      resolvedLayout = 'desktop';
      screenInfo = { isMobile: false, isTablet: false, isDesktop: true };
    }

    // Add screen dimensions if available
    if (isPlatformBrowser(this.platformId)) {
      screenInfo.screenWidth = window.innerWidth;
      screenInfo.screenHeight = window.innerHeight;
    }

    return of({
      layout: resolvedLayout,
      ...screenInfo
    } as BreakpointResolution);
  }

  private resolveLanguage(url: string): Observable<LanguageResolution> {
    try {
      const currentLanguage = this.i18nService.checkLanguage();
      const urlLanguage = this.routesService.getLanguageKeyFromUrl();
      
      // Update shared service with current language
      this.sharedService.updateFlightObjFn('defaultLanguage', currentLanguage);
      
      const isConsistent = urlLanguage === currentLanguage.key;
      
      if (!isConsistent) {
        this.logger.info('Language inconsistency detected', {
          currentLanguage: currentLanguage.key,
          urlLanguage,
          url
        });
        
        // TODO: Implement automatic language translation for query strings
        // this.routesService.addTranslateQueryStrings(currentLanguage.key);
      }

      return of({
        key: currentLanguage.key,
        locale: currentLanguage.locale,
        isConsistent,
        urlLanguage
      });
    } catch (error) {
      this.logger.warn('Language resolution fallback used', { error, url });
      
      return of({
        key: 'ro', // Default fallback
        locale: 'ro-RO',
        isConsistent: false
      });
    }
  }

  private getDefaultResolverData(): LayoutResolverData {
    return {
      gdpr: true, // Show GDPR by default if resolution fails
      resolution: 'desktop',
      defaultLanguage: 'ro',
      locale: 'ro-RO',
      timestamp: Date.now()
    };
  }

  // Utility method for testing/debugging
  getCurrentBreakpoints(): Record<string, boolean> {
    return {
      XSmall: this.breakpointObserver.isMatched(Breakpoints.XSmall),
      Small: this.breakpointObserver.isMatched(Breakpoints.Small),
      Medium: this.breakpointObserver.isMatched(Breakpoints.Medium),
      Large: this.breakpointObserver.isMatched(Breakpoints.Large),
      XLarge: this.breakpointObserver.isMatched(Breakpoints.XLarge)
    };
  }
}