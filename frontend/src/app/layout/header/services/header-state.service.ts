import { Injectable, computed, signal } from '@angular/core';
import { SharedService } from '../../../shared/shared.service';
import { HeaderState, HeaderConfig, LanguageOption, StepperStep } from '../types/header.types';
import { Language } from '../../../core/types';

@Injectable({
  providedIn: 'root'
})
export class HeaderStateService {
  // Internal signals
  private readonly _headerState = signal<HeaderState>({
    isMenuOpen: false,
    isLanguageMenuOpen: false,
    isStepperVisible: false,
    currentStep: 1,
    selectedLanguage: {} as Language
  });

  private readonly _headerConfig = signal<HeaderConfig>({
    showLogo: true,
    showLanguageSelector: true,
    showMenu: true,
    showStepper: true,
    logoUrl: 'assets/logo/logo-white.svg',
    logoAlt: 'Fravel Logo',
    isSticky: true,
    theme: 'transparent'
  });

  // Public computed signals
  readonly headerState = this._headerState.asReadonly();
  readonly headerConfig = this._headerConfig.asReadonly();
  
  // Computed properties for convenience
  readonly isMenuOpen = computed(() => this._headerState().isMenuOpen);
  readonly isLanguageMenuOpen = computed(() => this._headerState().isLanguageMenuOpen);
  readonly selectedLanguage = computed(() => this._headerState().selectedLanguage);
  readonly currentStep = computed(() => this._headerState().currentStep);

  constructor(private sharedService: SharedService) {
    // Sync with shared service state
    this.syncWithSharedService();
  }

  // State mutations
  toggleMenu(): void {
    const currentState = this._headerState();
    const newMenuState = !currentState.isMenuOpen;
    
    this._headerState.update(state => ({
      ...state,
      isMenuOpen: newMenuState
    }));
    
    // Update shared service
    this.sharedService.updateUiStatesObjFn([{ toggleMenu: newMenuState }]);
  }

  toggleLanguageMenu(): void {
    const currentState = this._headerState();
    const newLanguageMenuState = !currentState.isLanguageMenuOpen;
    
    this._headerState.update(state => ({
      ...state,
      isLanguageMenuOpen: newLanguageMenuState
    }));
    
    // Update shared service
    this.sharedService.updateUiStatesObjFn([
      { toggleLanguageMenu: newLanguageMenuState }
    ]);
  }

  setCurrentStep(step: number): void {
    this._headerState.update(state => ({
      ...state,
      currentStep: step
    }));
    
    // Update shared service
    this.sharedService.setStepFn(step);
  }

  updateLanguage(language: Language): void {
    this._headerState.update(state => ({
      ...state,
      selectedLanguage: language
    }));
  }

  updateConfig(config: Partial<HeaderConfig>): void {
    this._headerConfig.update(current => ({
      ...current,
      ...config
    }));
  }

  // Sync with shared service (reactive)
  private syncWithSharedService(): void {
    // This should be called from component with effect()
    // to maintain reactivity properly
  }

  // Method to be called from component effect
  syncFromSharedService(): void {
    const uiState = this.sharedService.uiState();
    const flightSearch = this.sharedService.flightSearch();
    const currentStep = this.sharedService.currentStep();

    this._headerState.update(state => ({
      ...state,
      isMenuOpen: uiState.toggleMenu,
      isLanguageMenuOpen: uiState.toggleLanguageMenu,
      isStepperVisible: uiState.toggleStepper,
      selectedLanguage: flightSearch.defaultLanguage,
      currentStep: currentStep
    }));
  }

  // Get stepper steps configuration
  getStepperSteps(): StepperStep[] {
    const current = this.currentStep();
    
    return [
      {
        id: 1,
        title: 'Selecteaza destinatia',
        isCompleted: current > 1,
        isActive: current === 1,
        isClickable: true
      },
      {
        id: 2,
        title: 'Pasageri si bagaje',
        isCompleted: current > 2,
        isActive: current === 2,
        isClickable: current >= 1
      },
      {
        id: 3,
        title: 'Alege data',
        isCompleted: current > 3,
        isActive: current === 3,
        isClickable: current >= 2
      },
      {
        id: 4,
        title: 'Alege zbor',
        isCompleted: current > 4,
        isActive: current === 4,
        isClickable: current >= 3
      },
      {
        id: 5,
        title: 'Finalizeaza',
        isCompleted: current > 5,
        isActive: current === 5,
        isClickable: current >= 4
      }
    ];
  }

  // Get available languages
  getLanguageOptions(): LanguageOption[] {
    const selected = this.selectedLanguage();
    // This should come from your language service
    // For now, using mock data
    return [
      {
        language: { key: 'ro', flag: 'assets/images/flags/ro.svg', language: 'Română' } as Language,
        isActive: selected.key === 'ro',
        isAvailable: true
      },
      {
        language: { key: 'en', flag: 'assets/images/flags/en.svg', language: 'English' } as Language,
        isActive: selected.key === 'en',
        isAvailable: true
      }
    ];
  }
}