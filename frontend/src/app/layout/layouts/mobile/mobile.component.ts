import { 
  CommonModule, 
  isPlatformBrowser 
} from '@angular/common';
import { 
  Component, 
  Inject, 
  PLATFORM_ID,
  signal,
  computed,
  effect,
  input,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';

// Flight booking components
import { SearchFlightsComponent } from '../../../features/flight-booking/components/search-flights/search-flights.component';
import { SelectDateComponent } from '../../../features/flight-booking/components/selectors/select-date/select-date.component';
import { SelectDepartureComponent } from '../../../features/flight-booking/components/selectors/select-departure/select-departure.component';
import { SelectDestinationComponent } from '../../../features/flight-booking/components/selectors/select-destination/select-destination.component';
import { SelectPersonsComponent } from '../../../features/flight-booking/components/selectors/select-persons/select-persons.component';

// Layout components and services
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { SharedService } from '../../../shared/shared.service';

// Base layout and types
import { BaseLayoutComponent, LayoutConfig } from '../base/base-layout.component';

// Types for mobile-specific functionality
interface MobileLayoutConfig extends LayoutConfig {
  swipeThreshold: number;
  autoCloseDelay: number;
  enablePullToRefresh: boolean;
  enableDoubleTapClose: boolean;
  hapticFeedback: boolean;
}

interface TouchState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  isScrolling: boolean;
  timestamp: number;
}

interface GestureEvent {
  type: 'swipe' | 'tap' | 'doubletap' | 'longpress';
  direction?: 'left' | 'right' | 'up' | 'down';
  target: string;
  preventDefault: boolean;
}

@Component({
  standalone: true,
  selector: 'app-mobile-layout',
  templateUrl: './mobile.component.html',
  styleUrls: ['./mobile.component.scss'],
  imports: [
    RouterModule,
    CommonModule,
    SelectDepartureComponent,
    SelectDestinationComponent,
    SelectPersonsComponent,
    SelectDateComponent,
    SearchFlightsComponent,
    SidebarComponent,
  ],
})
export class MobileLayoutComponent extends BaseLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('mobileContainer', { static: true }) mobileContainer!: ElementRef<HTMLElement>;
  
  // Input configuration for mobile-specific options
  mobileConfig = input<Partial<MobileLayoutConfig>>();
  
  // Private signals for mobile-specific state
  private readonly _touchState = signal<TouchState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    isScrolling: false,
    timestamp: 0
  });
  
  private readonly _mobileConfig = signal<MobileLayoutConfig>({
    enableSidebar: true,
    enableFlightComponents: true,
    animationDuration: 300,
    touchGestures: true,
    theme: 'auto',
    swipeThreshold: 100,
    autoCloseDelay: 5000,
    enablePullToRefresh: false,
    enableDoubleTapClose: true,
    hapticFeedback: true
  });
  
  // Computed properties for mobile layout
  readonly mobileLayoutConfig = computed(() => ({
    ...this._mobileConfig(),
    ...this.mobileConfig()
  }));
  
  readonly touchState = computed(() => this._touchState());
  
  readonly mobileLayoutClasses = computed(() => {
    const baseClasses = this.layoutClasses().split(' ');
    const mobileClasses = ['mobile-layout'];
    const state = this.layoutState();
    const config = this.mobileLayoutConfig();
    
    // Add base classes
    mobileClasses.push(...baseClasses);
    
    // Add mobile-specific classes
    if (state.toggleMenu) mobileClasses.push('mobile-layout--menu-open');
    if (this.hasActiveOverlay()) mobileClasses.push('mobile-layout--overlay-active');
    if (config.touchGestures) mobileClasses.push('mobile-layout--touch-enabled');
    if (this.layoutDimensions().orientation === 'landscape') {
      mobileClasses.push('mobile-layout--landscape');
    }
    
    // Animation state classes
    mobileClasses.push(`mobile-layout--animation-${config.animationDuration}ms`);
    
    return mobileClasses.join(' ');
  });
  
  readonly shouldShowSidebar = computed(() => {
    const config = this.mobileLayoutConfig();
    const state = this.layoutState();
    return config.enableSidebar && state.toggleMenu;
  });
  
  readonly overlayOpacity = computed(() => {
    const state = this.layoutState();
    if (!this.hasActiveOverlay()) return 0;
    return state.toggleMenu ? 0.5 : 0.3;
  });
  
  // Component visibility computed properties
  readonly showDeparture = computed(() => 
    this.shouldShowComponent('toggleDeparture') && this.layoutState().toggleDeparture
  );
  readonly showDestination = computed(() => 
    this.shouldShowComponent('toggleDestination') && this.layoutState().toggleDestination
  );
  readonly showPersons = computed(() => 
    this.shouldShowComponent('toggleSelectPersons') && this.layoutState().toggleSelectPersons
  );
  readonly showDate = computed(() => 
    this.shouldShowComponent('toggleSelectDate') && this.layoutState().toggleSelectDate
  );
  readonly showSearchFlight = computed(() => 
    this.shouldShowComponent('toggleSearchFlight') && this.layoutState().toggleSearchFlight
  );

  constructor(
    sharedService: SharedService,
    breakpointObserver: BreakpointObserver,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    super(sharedService, breakpointObserver, platformId);
    
    // Setup mobile-specific effects
    this.setupMobileEffects();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    
    // Apply mobile configuration
    const inputConfig = this.mobileConfig();
    if (inputConfig) {
      this._mobileConfig.update(current => ({
        ...current,
        ...inputConfig
      }));
    }
  }

  protected onLayoutInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initTouchGestures();
      this.initMobileOptimizations();
    }
  }

  private setupMobileEffects(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Auto-close overlays after delay
    effect(() => {
      const config = this.mobileLayoutConfig();
      if (this.hasActiveOverlay() && config.autoCloseDelay > 0) {
        const timer = setTimeout(() => {
          this.closeAllOverlays();
        }, config.autoCloseDelay);
        
        return () => clearTimeout(timer);
      } else {
        return undefined;
      }
    });
    
    // Prevent body scroll when overlays are active
    effect(() => {
      if (this.hasActiveOverlay()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  private initTouchGestures(): void {
    if (!this.mobileLayoutConfig().touchGestures) return;
    
    const container = this.mobileContainer?.nativeElement;
    if (!container) return;
    
    let touchTimeout: number;
    let tapCount = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      this._touchState.set({
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        deltaX: 0,
        deltaY: 0,
        isScrolling: false,
        timestamp: Date.now()
      });
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const touchState = this._touchState();
      
      this._touchState.update(current => ({
        ...current,
        currentX: touch.clientX,
        currentY: touch.clientY,
        deltaX: touch.clientX - touchState.startX,
        deltaY: touch.clientY - touchState.startY
      }));
      
      // Determine if user is scrolling
      const deltaX = Math.abs(this._touchState().deltaX);
      const deltaY = Math.abs(this._touchState().deltaY);
      
      if (deltaY > deltaX && deltaY > 10) {
        this._touchState.update(current => ({
          ...current,
          isScrolling: true
        }));
      }
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      const touchState = this._touchState();
      const config = this.mobileLayoutConfig();
      
      // Swipe gesture detection
      if (!touchState.isScrolling && Math.abs(touchState.deltaX) > config.swipeThreshold) {
        const direction = touchState.deltaX > 0 ? 'right' : 'left';
        this.handleGesture({
          type: 'swipe',
          direction,
          target: (e.target as HTMLElement).tagName.toLowerCase(),
          preventDefault: true
        });
      }
      
      // Tap gesture detection
      if (Math.abs(touchState.deltaX) < 10 && Math.abs(touchState.deltaY) < 10) {
        tapCount++;
        
        if (config.enableDoubleTapClose && tapCount === 2) {
          clearTimeout(touchTimeout);
          this.handleGesture({
            type: 'doubletap',
            target: (e.target as HTMLElement).tagName.toLowerCase(),
            preventDefault: false
          });
          tapCount = 0;
        } else {
          touchTimeout = window.setTimeout(() => {
            if (tapCount === 1) {
              this.handleGesture({
                type: 'tap',
                target: (e.target as HTMLElement).tagName.toLowerCase(),
                preventDefault: false
              });
            }
            tapCount = 0;
          }, 300);
        }
      }
      
      // Reset touch state
      this._touchState.set({
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        deltaX: 0,
        deltaY: 0,
        isScrolling: false,
        timestamp: 0
      });
    };
    
    // Add event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Cleanup on destroy
    this.destroy$.subscribe(() => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      if (touchTimeout) clearTimeout(touchTimeout);
    });
  }

  private handleGesture(gesture: GestureEvent): void {
    const config = this.mobileLayoutConfig();
    
    // Haptic feedback
    if (config.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    switch (gesture.type) {
      case 'swipe':
        this.handleSwipeGesture(gesture.direction!);
        break;
      case 'doubletap':
        if (this.hasActiveOverlay()) {
          this.closeAllOverlays();
        }
        break;
      case 'tap':
        // Handle tap on overlay background
        if (gesture.target === 'div' && this.hasActiveOverlay()) {
          this.closeAllOverlays();
        }
        break;
    }
  }

  private handleSwipeGesture(direction: 'left' | 'right' | 'up' | 'down'): void {
    const state = this.layoutState();
    
    switch (direction) {
      case 'right':
        if (!state.toggleMenu) {
          this.toggleMenu();
        }
        break;
      case 'left':
        if (state.toggleMenu) {
          this.toggleMenu();
        } else if (this.hasActiveOverlay()) {
          this.closeAllOverlays();
        }
        break;
      case 'up':
      case 'down':
        // Could be used for pull-to-refresh or dismiss overlays
        if (this.hasActiveOverlay()) {
          this.closeAllOverlays();
        }
        break;
    }
  }

  private initMobileOptimizations(): void {
    // Set viewport meta tag for proper mobile rendering
    let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.content = 'width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover';
    
    // Add theme-color meta tag
    let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.content = '#DBE8EB';
    
    // Prevent zoom on input focus
    const preventZoom = () => {
      document.body.style.userSelect = 'none';
      (document.body.style as any).webkitUserSelect = 'none';
    };
    
    document.addEventListener('focusin', preventZoom);
    document.addEventListener('focusout', () => {
      document.body.style.userSelect = '';
      (document.body.style as any).webkitUserSelect = '';
    });
  }

  // Public methods for template
  onOverlayClick(): void {
    if (this.hasActiveOverlay()) {
      this.closeAllOverlays();
    }
  }

  getContainerStyle(): { [key: string]: string } {
    const config = this.mobileLayoutConfig();
    return {
      '--animation-duration': `${config.animationDuration}ms`,
      '--overlay-opacity': `${this.overlayOpacity()}`,
    };
  }

  // Accessibility methods
  getMobileAriaLabel(): string {
    const state = this.layoutState();
    const labels = ['Mobile travel booking layout'];
    
    if (state.toggleMenu) labels.push('navigation menu open');
    if (this.hasActiveOverlay()) labels.push('overlay active');
    
    return labels.join(', ');
  }

  getComponentAriaProps(component: string) {
    const state = this.layoutState();
    const isOpen = state[`toggle${component}` as keyof typeof state];
    
    return {
      'aria-hidden': !isOpen,
      'aria-expanded': isOpen,
      'role': 'dialog',
      'aria-modal': isOpen
    };
  }
}