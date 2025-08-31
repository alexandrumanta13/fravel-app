import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { PLATFORM_ID } from '@angular/core';

import { HeaderComponent } from './header.component';
import { HeaderStateService } from './services/header-state.service';
import { SharedService } from '../../shared/shared.service';
import { HeaderState, HeaderConfig, LanguageOption, StepperStep } from './types/header.types';
import { Language } from '../../core/types';

@Component({
  selector: 'app-stepper',
  template: '<ng-content></ng-content>',
  standalone: true
})
class MockStepperComponent {}

@Component({
  selector: 'app-step',
  template: '<ng-content></ng-content>',
  standalone: true
})
class MockStepComponent {}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let headerStateService: jasmine.SpyObj<HeaderStateService>;
  let sharedService: jasmine.SpyObj<SharedService>;

  const mockLanguage: Language = {
    key: 'en',
    flag: 'assets/images/flags/en.svg',
    language: 'English'
  };

  const mockHeaderState: HeaderState = {
    isMenuOpen: false,
    isLanguageMenuOpen: false,
    isStepperVisible: true,
    currentStep: 1,
    selectedLanguage: mockLanguage
  };

  const mockHeaderConfig: HeaderConfig = {
    showLogo: true,
    showLanguageSelector: true,
    showMenu: true,
    showStepper: true,
    logoUrl: 'assets/logo/logo-white.svg',
    logoAlt: 'Fravel Logo',
    isSticky: true,
    theme: 'transparent'
  };

  const mockStepperSteps: StepperStep[] = [
    { id: 1, title: 'Step 1', isCompleted: false, isActive: true, isClickable: true },
    { id: 2, title: 'Step 2', isCompleted: false, isActive: false, isClickable: false }
  ];

  const mockLanguageOptions: LanguageOption[] = [
    {
      language: mockLanguage,
      isActive: true,
      isAvailable: true
    }
  ];

  beforeEach(async () => {
    const headerStateSpy = jasmine.createSpyObj('HeaderStateService', [
      'toggleMenu',
      'toggleLanguageMenu',
      'setCurrentStep',
      'updateLanguage',
      'updateConfig',
      'syncFromSharedService',
      'getStepperSteps',
      'getLanguageOptions'
    ], {
      headerState: signal(mockHeaderState),
      headerConfig: signal(mockHeaderConfig),
      isMenuOpen: signal(false),
      isLanguageMenuOpen: signal(false),
      selectedLanguage: signal(mockLanguage),
      currentStep: signal(1)
    });

    const sharedSpy = jasmine.createSpyObj('SharedService', [
      'updateUiStatesObjFn',
      'setStepFn'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        RouterTestingModule,
        MockStepperComponent,
        MockStepComponent
      ],
      providers: [
        { provide: HeaderStateService, useValue: headerStateSpy },
        { provide: SharedService, useValue: sharedSpy },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    headerStateService = TestBed.inject(HeaderStateService) as jasmine.SpyObj<HeaderStateService>;
    sharedService = TestBed.inject(SharedService) as jasmine.SpyObj<SharedService>;

    headerStateService.getStepperSteps.and.returnValue(mockStepperSteps);
    headerStateService.getLanguageOptions.and.returnValue(mockLanguageOptions);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should sync from shared service on init in browser', () => {
      component.ngOnInit();
      expect(headerStateService.syncFromSharedService).toHaveBeenCalled();
    });

    it('should apply input configuration on init', () => {
      const inputConfig: Partial<HeaderConfig> = { showLogo: false };
      component.config = signal(inputConfig);
      
      component.ngOnInit();
      
      expect(headerStateService.updateConfig).toHaveBeenCalledWith(inputConfig);
    });
  });

  describe('Menu Interactions', () => {
    it('should toggle menu when onToggleMenu is called', () => {
      component.onToggleMenu();
      expect(headerStateService.toggleMenu).toHaveBeenCalled();
    });

    it('should toggle language menu when onToggleLanguage is called', () => {
      component.onToggleLanguage();
      expect(headerStateService.toggleLanguageMenu).toHaveBeenCalled();
    });
  });

  describe('Step Interactions', () => {
    it('should set current step when step is clickable', () => {
      const clickableStep: StepperStep = {
        id: 2,
        title: 'Step 2',
        isCompleted: false,
        isActive: false,
        isClickable: true
      };

      component.onStepClick(clickableStep);

      expect(headerStateService.setCurrentStep).toHaveBeenCalledWith(2);
    });

    it('should not set current step when step is not clickable', () => {
      const nonClickableStep: StepperStep = {
        id: 2,
        title: 'Step 2',
        isCompleted: false,
        isActive: false,
        isClickable: false
      };

      component.onStepClick(nonClickableStep);

      expect(headerStateService.setCurrentStep).not.toHaveBeenCalled();
    });
  });

  describe('Language Selection', () => {
    it('should update language when option is available and not active', () => {
      const languageOption: LanguageOption = {
        language: { key: 'ro', flag: 'assets/images/flags/ro.svg', language: 'Română' },
        isActive: false,
        isAvailable: true
      };

      component.onLanguageSelect(languageOption);

      expect(headerStateService.updateLanguage).toHaveBeenCalledWith(languageOption.language);
    });

    it('should not update language when option is not available', () => {
      const unavailableOption: LanguageOption = {
        language: mockLanguage,
        isActive: false,
        isAvailable: false
      };

      component.onLanguageSelect(unavailableOption);

      expect(headerStateService.updateLanguage).not.toHaveBeenCalled();
    });

    it('should not update language when option is already active', () => {
      const activeOption: LanguageOption = {
        language: mockLanguage,
        isActive: true,
        isAvailable: true
      };

      component.onLanguageSelect(activeOption);

      expect(headerStateService.updateLanguage).not.toHaveBeenCalled();
    });
  });

  describe('CSS Classes', () => {
    it('should return correct stepper CSS class when stepper is visible', () => {
      headerStateService.headerState = signal({
        ...mockHeaderState,
        isStepperVisible: true
      });

      const result = component.getStepperCssClass();

      expect(result).toBe('stepper show');
    });

    it('should return correct stepper CSS class when stepper is hidden', () => {
      headerStateService.headerState = signal({
        ...mockHeaderState,
        isStepperVisible: false
      });

      const result = component.getStepperCssClass();

      expect(result).toBe('stepper');
    });

    it('should return correct header CSS classes', () => {
      headerStateService.headerConfig = signal({
        ...mockHeaderConfig,
        isSticky: true,
        theme: 'dark'
      });
      headerStateService.isMenuOpen = signal(true);

      const result = component.getHeaderCssClasses();

      expect(result).toBe('header header--sticky header--dark header--menu-open');
    });

    it('should not include theme class for transparent theme', () => {
      headerStateService.headerConfig = signal({
        ...mockHeaderConfig,
        theme: 'transparent'
      });

      const result = component.getHeaderCssClasses();

      expect(result).toBe('header header--sticky');
    });
  });

  describe('TrackBy Functions', () => {
    it('should track language options by key', () => {
      const option: LanguageOption = {
        language: { key: 'en', flag: 'flag.svg', language: 'English' },
        isActive: false,
        isAvailable: true
      };

      const result = component.trackByLanguageKey(0, option);

      expect(result).toBe('en');
    });

    it('should track stepper steps by id', () => {
      const step: StepperStep = {
        id: 3,
        title: 'Step 3',
        isCompleted: false,
        isActive: false,
        isClickable: true
      };

      const result = component.trackByStepId(0, step);

      expect(result).toBe(3);
    });
  });

  describe('Computed Properties', () => {
    it('should return correct menu animation state when menu is open', () => {
      headerStateService.isMenuOpen = signal(true);
      
      const result = component.menuAnimationState();
      
      expect(result).toBe('open');
    });

    it('should return correct menu animation state when menu is closed', () => {
      headerStateService.isMenuOpen = signal(false);
      
      const result = component.menuAnimationState();
      
      expect(result).toBe('closed');
    });

    it('should return stepper steps from service', () => {
      const result = component.stepperSteps();
      
      expect(result).toBe(mockStepperSteps);
      expect(headerStateService.getStepperSteps).toHaveBeenCalled();
    });

    it('should return language options from service', () => {
      const result = component.languageOptions();
      
      expect(result).toBe(mockLanguageOptions);
      expect(headerStateService.getLanguageOptions).toHaveBeenCalled();
    });
  });

  describe('Component Lifecycle', () => {
    it('should complete destroy subject on destroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });
});
