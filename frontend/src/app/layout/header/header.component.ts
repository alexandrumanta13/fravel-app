import { 
  Component, 
  OnInit, 
  OnDestroy, 
  Inject, 
  PLATFORM_ID, 
  effect,
  input,
  computed,
  Signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';

// Internal services and types
import { HeaderStateService } from './services/header-state.service';
import { HeaderConfig, StepperStep, LanguageOption } from './types/header.types';

// Shared components
import { StepperComponent } from '../../shared/components/ui/stepper/stepper.component';
import { StepComponent } from '../../shared/components/ui/stepper/step/step.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StepperComponent,
    StepComponent
  ],
})
export class HeaderComponent implements OnInit, OnDestroy {
  // Input for configuration
  config = input<Partial<HeaderConfig>>();
  
  // Computed properties from service - will be initialized in constructor
  readonly headerState!: typeof this.headerStateService.headerState;
  readonly headerConfig!: typeof this.headerStateService.headerConfig;
  readonly isMenuOpen!: typeof this.headerStateService.isMenuOpen;
  readonly isLanguageMenuOpen!: typeof this.headerStateService.isLanguageMenuOpen;
  readonly selectedLanguage!: typeof this.headerStateService.selectedLanguage;
  readonly currentStep!: typeof this.headerStateService.currentStep;
  
  // Computed derived data - will be initialized in constructor
  readonly stepperSteps!: Signal<StepperStep[]>;
  readonly languageOptions!: Signal<LanguageOption[]>;
  readonly logoUrl!: Signal<string>;
  readonly logoAlt!: Signal<string>;
  readonly menuAnimationState!: Signal<string>;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private headerStateService: HeaderStateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Initialize computed properties after service injection
    (this as any).headerState = this.headerStateService.headerState;
    (this as any).headerConfig = this.headerStateService.headerConfig;
    (this as any).isMenuOpen = this.headerStateService.isMenuOpen;
    (this as any).isLanguageMenuOpen = this.headerStateService.isLanguageMenuOpen;
    (this as any).selectedLanguage = this.headerStateService.selectedLanguage;
    (this as any).currentStep = this.headerStateService.currentStep;
    
    // Initialize computed derived data
    (this as any).stepperSteps = computed(() => this.headerStateService.getStepperSteps());
    (this as any).languageOptions = computed(() => this.headerStateService.getLanguageOptions());
    (this as any).logoUrl = computed(() => this.headerConfig().logoUrl);
    (this as any).logoAlt = computed(() => this.headerConfig().logoAlt);
    (this as any).menuAnimationState = computed(() => 
      this.isMenuOpen() ? 'open' : 'closed'
    );
  }

  ngOnInit(): void {
    // Setup reactive sync with shared service
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        this.headerStateService.syncFromSharedService();
      });
    }

    // Apply input configuration
    const inputConfig = this.config();
    if (inputConfig) {
      this.headerStateService.updateConfig(inputConfig);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Event handlers
  onToggleMenu(): void {
    this.headerStateService.toggleMenu();
  }

  onToggleLanguage(): void {
    this.headerStateService.toggleLanguageMenu();
  }

  onStepClick(step: StepperStep): void {
    if (step.isClickable) {
      this.headerStateService.setCurrentStep(step.id);
    }
  }

  onLanguageSelect(option: LanguageOption): void {
    if (option.isAvailable && !option.isActive) {
      this.headerStateService.updateLanguage(option.language);
    }
  }

  // Utility methods for template
  getStepperCssClass(): string {
    const state = this.headerState();
    return state.isStepperVisible ? 'stepper show' : 'stepper';
  }

  getHeaderCssClasses(): string {
    const config = this.headerConfig();
    const classes = ['header'];
    
    if (config.isSticky) classes.push('header--sticky');
    if (config.theme !== 'transparent') classes.push(`header--${config.theme}`);
    if (this.isMenuOpen()) classes.push('header--menu-open');
    
    return classes.join(' ');
  }

  // TrackBy functions for performance
  trackByLanguageKey(_index: number, option: LanguageOption): string {
    return option.language.key;
  }

  trackByStepId(_index: number, step: StepperStep): number {
    return step.id;
  }
}
