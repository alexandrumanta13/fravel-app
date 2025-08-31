import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { PLATFORM_ID } from '@angular/core';

import { LayoutResolver } from './layout.resolver';
import { I18nService } from '../../shared/components/common/i18n/i18n.service';
import { RoutesService } from '../../core/services';
import { SharedService } from '../../shared/shared.service';
import { LayoutLoggerService } from '../services/layout-logger.service';
import { LayoutStrategyService } from '../services/layout-strategy.service';

describe('LayoutResolver', () => {
  let resolver: LayoutResolver;
  let breakpointObserver: jasmine.SpyObj<BreakpointObserver>;
  let i18nService: jasmine.SpyObj<I18nService>;

  beforeEach(() => {
    const breakpointSpy = jasmine.createSpyObj('BreakpointObserver', ['isMatched']);
    const i18nSpy = jasmine.createSpyObj('I18nService', ['checkLanguage']);
    const routesSpy = jasmine.createSpyObj('RoutesService', ['getLanguageKeyFromUrl']);
    const sharedSpy = jasmine.createSpyObj('SharedService', ['updateFlightObjFn']);
    const loggerSpy = jasmine.createSpyObj('LayoutLoggerService', ['debug', 'error', 'warn', 'info']);
    const strategySpy = jasmine.createSpyObj('LayoutStrategyService', ['getStrategy']);

    TestBed.configureTestingModule({
      providers: [
        LayoutResolver,
        { provide: BreakpointObserver, useValue: breakpointSpy },
        { provide: I18nService, useValue: i18nSpy },
        { provide: RoutesService, useValue: routesSpy },
        { provide: SharedService, useValue: sharedSpy },
        { provide: LayoutLoggerService, useValue: loggerSpy },
        { provide: LayoutStrategyService, useValue: strategySpy },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    resolver = TestBed.inject(LayoutResolver);
    breakpointObserver = TestBed.inject(BreakpointObserver) as jasmine.SpyObj<BreakpointObserver>;
    i18nService = TestBed.inject(I18nService) as jasmine.SpyObj<I18nService>;
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should resolve mobile layout for small screens', (done) => {
    // Arrange
    breakpointObserver.isMatched.and.callFake((query: string) => {
      return query.includes('max-width: 599.98px'); // XSmall breakpoint
    });

    i18nService.checkLanguage.and.returnValue({
      key: 'ro',
      locale: 'ro-RO',
      language: 'Romana',
      isDefault: true
    } as any);

    const route = new ActivatedRouteSnapshot();
    route.data = { layout: 'mobile' };
    
    const state = { url: '/test' } as RouterStateSnapshot;

    // Act
    resolver.resolve(route, state).subscribe(result => {
      // Assert
      expect(result.resolution).toBe('mobile');
      expect(result.defaultLanguage).toBe('ro');
      expect(result.timestamp).toBeGreaterThan(0);
      done();
    });
  });

  it('should resolve desktop layout for large screens', (done) => {
    // Arrange
    breakpointObserver.isMatched.and.callFake((query: string) => {
      return query.includes('min-width: 1200px'); // Large breakpoint
    });

    i18nService.checkLanguage.and.returnValue({
      key: 'en',
      locale: 'en-US',
      language: 'English',
      isDefault: false
    } as any);

    const route = new ActivatedRouteSnapshot();
    route.data = { layout: 'desktop' };
    
    const state = { url: '/test' } as RouterStateSnapshot;

    // Act
    resolver.resolve(route, state).subscribe(result => {
      // Assert
      expect(result.resolution).toBe('desktop');
      expect(result.defaultLanguage).toBe('en');
      done();
    });
  });

  it('should resolve admin layout regardless of breakpoint', (done) => {
    // Arrange
    const route = new ActivatedRouteSnapshot();
    route.data = { layout: 'admin' };
    
    const state = { url: '/admin' } as RouterStateSnapshot;

    i18nService.checkLanguage.and.returnValue({
      key: 'ro',
      locale: 'ro-RO',
      language: 'Romana',
      isDefault: true
    } as any);

    // Act
    resolver.resolve(route, state).subscribe(result => {
      // Assert
      expect(result.resolution).toBe('admin');
      done();
    });
  });

  it('should handle errors gracefully', (done) => {
    // Arrange
    i18nService.checkLanguage.and.throwError('Service error');
    
    const route = new ActivatedRouteSnapshot();
    const state = { url: '/test' } as RouterStateSnapshot;

    // Act
    resolver.resolve(route, state).subscribe(result => {
      // Assert
      expect(result).toBeDefined();
      expect(result.resolution).toBe('desktop'); // Default fallback
      expect(result.defaultLanguage).toBe('ro'); // Default fallback
      done();
    });
  });

  it('should get current breakpoints', () => {
    // Arrange
    breakpointObserver.isMatched.and.returnValue(true);

    // Act
    const breakpoints = resolver.getCurrentBreakpoints();

    // Assert
    expect(breakpoints).toBeDefined();
    expect(Object.keys(breakpoints)).toEqual(['XSmall', 'Small', 'Medium', 'Large', 'XLarge']);
  });
});