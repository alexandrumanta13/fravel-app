import {
  Component,
  Inject,
  LOCALE_ID,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  effect,
  ViewContainerRef,
  ComponentRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Layout, LayoutConfig } from './layout.types';
import { LayoutStrategyService } from './services/layout-strategy.service';

import { ResponsiveLayoutComponent } from './layouts/responsive/responsive-layout.component';
import { AdminLayoutComponent } from './layouts/admin/admin.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GdprComponent } from '../shared/components/common/gdpr/gdpr.component';
import { HeaderComponent } from './header/header.component';
import { I18nComponent } from '../shared/components/common/i18n/i18n.component';
import { LoaderComponent } from '../shared/components/ui/loader/loader.component';
import { SharedService } from '../shared/shared.service';
import { Subject } from 'rxjs';
import { LocaleLayoutService, LocaleLayoutInfo } from './services/locale-layout.service';
import { LocaleDatePipe, LocaleCurrencyPipe, LocaleNumberPipe } from './pipes/locale-format.pipe';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone: true,
  imports: [
    ResponsiveLayoutComponent,
    AdminLayoutComponent,
    CommonModule,
    GdprComponent,
    LoaderComponent,
    I18nComponent,
    HeaderComponent,
    LocaleDatePipe,
    LocaleCurrencyPipe,
    LocaleNumberPipe,
  ],
})
export class LayoutComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('layoutContainer', { read: ViewContainerRef, static: true }) 
  layoutContainer!: ViewContainerRef;

  layout!: Layout;
  layoutConfig!: LayoutConfig;
  localeInfo!: LocaleLayoutInfo;
  showGDPR: boolean = false;
  toggleLoader: boolean = true;
  
  private destroy$ = new Subject<void>();
  private layoutComponentRef?: ComponentRef<any>;

  constructor(
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private layoutStrategyService: LayoutStrategyService,
    private localeLayoutService: LocaleLayoutService,
    @Inject(LOCALE_ID) public localeId: string,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    effect(() => {
      this.toggleLoader = this.sharedService.uiState().toggleLoader;
    });
  }

  ngOnInit(): void {
    // Initialize locale information first
    this.localeInfo = this.localeLayoutService.getLocaleLayoutInfo();
    this.localeLayoutService.syncLocales();

    const layoutData = this.route.snapshot.data['layoutResolver'];
    if (layoutData) {
      this.layout = layoutData.resolution;
      const strategy = this.layoutStrategyService.getStrategy(this.layout);
      this.layoutConfig = strategy.config;
      
      // Log layout resolution for debugging
      if (!environment.production) {
        console.debug('Layout resolved:', {
          layout: this.layout,
          config: this.layoutConfig,
          locale: layoutData.locale,
          timestamp: new Date(layoutData.timestamp).toISOString()
        });
      }
    }

    if (isPlatformBrowser(this.platformId)) {
      this.showGDPR = layoutData?.gdpr || false;
      this.initializeScreenData();
      this.applyLocaleStyles();
    }
  }

  ngAfterViewInit(): void {
    this.loadLayoutComponent();
    this.sharedService.updateUiStatesObjFn([{ showLoader: false }]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.layoutComponentRef) {
      this.layoutComponentRef.destroy();
    }
  }

  private initializeScreenData(): void {
    this.sharedService.updateUiStatesObjFn([
      { screenWidth: window.innerWidth },
      { screenHeight: window.innerHeight },
      { isMobile: this.layout === 'mobile' },
      { isTablet: this.layout === 'tablet' },
      { isDesktop: this.layout === 'desktop' },
    ]);
  }

  private loadLayoutComponent(): void {
    if (this.layoutComponentRef) {
      this.layoutComponentRef.destroy();
    }

    const strategy = this.layoutStrategyService.getStrategy(this.layout);
    this.layoutContainer.clear();
    
    this.layoutComponentRef = this.layoutContainer.createComponent(strategy.component);
    
    // Pass any required data to the component
    if (this.layoutComponentRef.instance && 'config' in this.layoutComponentRef.instance) {
      this.layoutComponentRef.instance.config = this.layoutConfig;
    }
  }

  acceptGDPR(): void {
    this.showGDPR = false;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('_fvrl_ckie_cnst', 'true');
    }
  }

  private applyLocaleStyles(): void {
    const document = window.document;
    const htmlElement = document.documentElement;
    
    // Apply direction (RTL/LTR)
    htmlElement.setAttribute('dir', this.localeInfo.direction);
    htmlElement.setAttribute('lang', this.localeId);
    
    // Add CSS classes for locale-specific styling
    const existingClasses = htmlElement.className;
    const localeClasses = this.localeInfo.cssClass;
    
    // Remove old locale classes
    htmlElement.className = existingClasses.replace(/locale-\w+|region-\w+/g, '').trim();
    
    // Add new locale classes
    htmlElement.className = `${htmlElement.className} ${localeClasses}`.trim();
    
    // Apply custom font if needed
    if (this.localeInfo.fontFamily) {
      document.body.style.fontFamily = this.localeInfo.fontFamily;
    }
  }

  // Utility methods for templates
  formatPrice(amount: number, currency?: string): string {
    return this.localeLayoutService.formatCurrency(amount, currency);
  }

  formatDate(date: Date): string {
    return this.localeLayoutService.formatDate(date);
  }

  formatNumber(value: number): string {
    return this.localeLayoutService.formatNumber(value);
  }

  get isRTL(): boolean {
    return this.localeInfo?.isRTL || false;
  }

  get currentCurrency(): string {
    return this.localeInfo?.currency || 'RON';
  }
}
