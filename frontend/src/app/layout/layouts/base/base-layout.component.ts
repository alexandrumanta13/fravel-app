import { 
  Component, 
  OnDestroy, 
  OnInit, 
  Inject, 
  PLATFORM_ID, 
  effect,
  signal,
  computed
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedService } from '../../../shared/shared.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject, takeUntil } from 'rxjs';

// Enhanced types for better type safety
export interface LayoutState {
  toggleFilter: boolean;
  toggleMenu: boolean;
  toggleDeparture: boolean;
  toggleDestination: boolean;
  toggleSelectPersons: boolean;
  toggleSelectDate: boolean;
  toggleSearchFlight: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export interface LayoutConfig {
  enableSidebar: boolean;
  enableFlightComponents: boolean;
  animationDuration: number;
  touchGestures: boolean;
  theme: 'light' | 'dark' | 'auto';
  maxWidth?: string;
}

export interface LayoutDimensions {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
}

@Component({
  template: ''
})
export abstract class BaseLayoutComponent implements OnInit, OnDestroy {
  protected readonly destroy$ = new Subject<void>();
  
  // Reactive state management with signals
  private readonly _layoutState = signal<LayoutState>({
    toggleFilter: false,
    toggleMenu: false,
    toggleDeparture: false,
    toggleDestination: false,
    toggleSelectPersons: false,
    toggleSelectDate: false,
    toggleSearchFlight: false,
    isMobile: false,
    isTablet: false,
    isDesktop: false
  });
  
  private readonly _layoutConfig = signal<LayoutConfig>({
    enableSidebar: true,
    enableFlightComponents: true,
    animationDuration: 300,
    touchGestures: true,
    theme: 'auto'
  });
  
  private readonly _layoutDimensions = signal<LayoutDimensions>({
    width: 0,
    height: 0,
    orientation: 'portrait'
  });
  
  // Public computed properties
  readonly layoutState = computed(() => this._layoutState());
  readonly layoutConfig = computed(() => this._layoutConfig());
  readonly layoutDimensions = computed(() => this._layoutDimensions());
  
  // Computed layout helpers
  readonly isMobileLayout = computed(() => this._layoutState().isMobile);
  readonly isTabletLayout = computed(() => this._layoutState().isTablet);
  readonly isDesktopLayout = computed(() => this._layoutState().isDesktop);
  readonly hasActiveOverlay = computed(() => {
    const state = this._layoutState();
    return state.toggleMenu || 
           state.toggleDeparture || 
           state.toggleDestination || 
           state.toggleSelectPersons || 
           state.toggleSelectDate || 
           state.toggleSearchFlight;
  });
  
  readonly layoutClasses = computed(() => {
    const state = this._layoutState();
    const config = this._layoutConfig();
    const classes = ['layout'];
    
    if (state.isMobile) classes.push('layout--mobile');
    if (state.isTablet) classes.push('layout--tablet');
    if (state.isDesktop) classes.push('layout--desktop');
    if (state.toggleMenu) classes.push('layout--menu-open');
    if (this.hasActiveOverlay()) classes.push('layout--overlay-active');
    if (config.touchGestures) classes.push('layout--touch-enabled');
    
    classes.push(`layout--theme-${config.theme}`);
    
    return classes.join(' ');
  });

  constructor(
    protected sharedService: SharedService,
    protected breakpointObserver: BreakpointObserver,
    @Inject(PLATFORM_ID) protected platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.initLayoutStateEffects();
      this.initBreakpointObserver();
      this.initDimensionTracking();
    }
  }

  ngOnInit(): void {
    this.onLayoutInit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected abstract onLayoutInit(): void;

  // Public methods for state management
  updateLayoutConfig(config: Partial<LayoutConfig>): void {
    this._layoutConfig.update(current => ({
      ...current,
      ...config
    }));
  }

  toggleMenu(): void {
    this._layoutState.update(current => ({
      ...current,
      toggleMenu: !current.toggleMenu
    }));
    
    // Sync with shared service
    this.sharedService.updateUiStatesObjFn([
      { toggleMenu: this._layoutState().toggleMenu }
    ]);
  }

  closeAllOverlays(): void {
    this._layoutState.update(current => ({
      ...current,
      toggleMenu: false,
      toggleFilter: false,
      toggleDeparture: false,
      toggleDestination: false,
      toggleSelectPersons: false,
      toggleSelectDate: false,
      toggleSearchFlight: false
    }));
    
    // Sync with shared service
    const state = this._layoutState();
    this.sharedService.updateUiStatesObjFn([
      { toggleMenu: false },
      { toggleFilter: false },
      { toggleDeparture: false },
      { toggleDestination: false },
      { toggleSelectPersons: false },
      { toggleSelectDate: false },
      { toggleSearchFlight: false }
    ]);
  }

  private initLayoutStateEffects(): void {
    // Watch shared service state changes
    effect(() => {
      const uiState = this.sharedService.uiState();
      this._layoutState.update(current => ({
        ...current,
        toggleFilter: uiState.toggleFilter,
        toggleMenu: uiState.toggleMenu,
        toggleDeparture: uiState.toggleDeparture,
        toggleDestination: uiState.toggleDestination,
        toggleSelectPersons: uiState.toggleSelectPersons,
        toggleSelectDate: uiState.toggleSelectDate,
        toggleSearchFlight: uiState.toggleSearchFlight,
      }));
    });
    
    // Auto-close overlays on breakpoint changes
    effect(() => {
      const state = this._layoutState();
      if (state.isDesktop && this.hasActiveOverlay()) {
        // Auto-close mobile overlays when switching to desktop
        this.closeAllOverlays();
      }
    });
  }

  private initBreakpointObserver(): void {
    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge
    ]).pipe(takeUntil(this.destroy$)).subscribe(result => {
      const isMobile = this.breakpointObserver.isMatched([Breakpoints.XSmall, Breakpoints.Small]);
      const isTablet = this.breakpointObserver.isMatched(Breakpoints.Medium);
      const isDesktop = this.breakpointObserver.isMatched([Breakpoints.Large, Breakpoints.XLarge]);
      
      this._layoutState.update(current => ({
        ...current,
        isMobile,
        isTablet,
        isDesktop
      }));
      
      // Sync with shared service
      this.sharedService.updateUiStatesObjFn([
        { isMobile },
        { isTablet },
        { isDesktop }
      ]);
    });
  }

  private initDimensionTracking(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const orientation = width > height ? 'landscape' : 'portrait';
      
      this._layoutDimensions.set({
        width,
        height,
        orientation
      });
    };
    
    // Initial dimensions
    updateDimensions();
    
    // Listen for resize events
    window.addEventListener('resize', updateDimensions, { passive: true });
    window.addEventListener('orientationchange', updateDimensions, { passive: true });
    
    // Cleanup on destroy
    this.destroy$.subscribe(() => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    });
  }

  // Accessibility helpers
  getAriaLabel(): string {
    const state = this._layoutState();
    if (state.isMobile) return 'Mobile layout';
    if (state.isTablet) return 'Tablet layout';
    return 'Desktop layout';
  }

  getLayoutAriaDescribedBy(): string {
    const state = this._layoutState();
    const descriptions = [];
    
    if (state.toggleMenu) descriptions.push('menu-open');
    if (this.hasActiveOverlay()) descriptions.push('overlay-active');
    
    return descriptions.join(' ') || '';
  }

  // Performance optimization
  shouldShowComponent(componentName: keyof LayoutState): boolean {
    const state = this._layoutState();
    const config = this._layoutConfig();
    
    // Don't render flight components if disabled
    if (!config.enableFlightComponents && 
        ['toggleDeparture', 'toggleDestination', 'toggleSelectPersons', 
         'toggleSelectDate', 'toggleSearchFlight'].includes(componentName)) {
      return false;
    }
    
    return state[componentName] as boolean;
  }
}