import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { signal } from '@angular/core';

import { I18nComponent } from './i18n.component';
import { I18nService } from './i18n.service';
import { SharedService } from '../../../shared.service';
import { RoutesService } from '../../../../core/services';
import { Language, Languages } from '../../../../core/types';

describe('I18nComponent', () => {
  let component: I18nComponent;
  let fixture: ComponentFixture<I18nComponent>;
  let i18nService: jasmine.SpyObj<I18nService>;
  let sharedService: jasmine.SpyObj<SharedService>;
  let routesService: jasmine.SpyObj<RoutesService>;

  const mockLanguage: Language = {
    key: 'en',
    flag: 'assets/flags/en.svg',
    language: 'English',
    defaultCurrency: 'EUR',
    currency: [
      { value: 'EUR' },
      { value: 'USD' }
    ]
  };

  const mockLanguages: Languages[] = [
    {
      key: 'en',
      flag: 'assets/flags/en.svg',
      language: 'English',
      defaultCurrency: 'EUR',
      currency: [{ value: 'EUR' }, { value: 'USD' }],
      isDefault: true
    },
    {
      key: 'ro',
      flag: 'assets/flags/ro.svg',
      language: 'Română',
      defaultCurrency: 'RON',
      currency: [{ value: 'RON' }, { value: 'EUR' }],
      isDefault: false
    }
  ];

  const mockUiState = {
    toggleLanguageMenu: false,
    toggleStepper: false,
    toggleFilter: false,
    toggleLoader: false,
    toggleMenu: false,
    toggleSelectPersons: false,
    toggleSelectDate: false,
    isMobile: false,
    currentStep: 1,
    screenWidth: 1024,
    screenHeight: 768,
    toggleDeparture: false,
    toggleDestination: false,
    toggleSearchFlight: false
  };

  const mockFlightSearch = {
    defaultLanguage: mockLanguage,
    departureCity: {} as any,
    destinationCity: {} as any,
    dateFrom: 0,
    dateTo: 0,
    isFlightTypeOneWay: false,
    infoSerialized: {} as any,
    infoSerializedOptionsPersons: {} as any,
    infoSerializedOptionsBags: {} as any,
    daysToAdd: 0,
    cabinClass: 'M',
    dateFromSubstract: 0,
    dateToAdd: 0,
    returnDateFromSubstract: 0,
    returnDateToAdd: 0
  };

  beforeEach(async () => {
    const i18nSpy = jasmine.createSpyObj('I18nService', [
      'checkLanguage',
      'setDefaultLanguage',
      'getDefaultLanguage',
      'getAvailableLanguages'
    ], {
      currentLanguage: signal(mockLanguage),
      isInitialized: signal(true),
      error: signal(null),
      hasValidLanguage: signal(true)
    });

    const sharedSpy = jasmine.createSpyObj('SharedService', [
      'updateUiStatesObjFn',
      'updateFlightObjFn'
    ], {
      uiState: signal(mockUiState),
      flightSearch: signal(mockFlightSearch)
    });

    const routesSpy = jasmine.createSpyObj('RoutesService', ['navigateToRoute']);

    await TestBed.configureTestingModule({
      imports: [I18nComponent],
      providers: [
        { provide: I18nService, useValue: i18nSpy },
        { provide: SharedService, useValue: sharedSpy },
        { provide: RoutesService, useValue: routesSpy },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(I18nComponent);
    component = fixture.componentInstance;
    i18nService = TestBed.inject(I18nService) as jasmine.SpyObj<I18nService>;
    sharedService = TestBed.inject(SharedService) as jasmine.SpyObj<SharedService>;
    routesService = TestBed.inject(RoutesService) as jasmine.SpyObj<RoutesService>;

    i18nService.checkLanguage.and.returnValue(mockLanguage);
    i18nService.getAvailableLanguages.and.returnValue(mockLanguages);
    i18nService.setDefaultLanguage.and.returnValue(true);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with available languages', () => {
      expect(component.availableLanguages).toEqual(mockLanguages);
    });

    it('should call checkLanguage on init', () => {
      expect(i18nService.checkLanguage).toHaveBeenCalled();
    });

    it('should sync with shared service state', () => {
      const newUiState = { ...mockUiState, toggleLanguageMenu: true };
      sharedService.uiState = signal(newUiState);
      
      component.ngOnInit();
      
      expect(component.isMenuOpen()).toBe(true);
    });
  });

  describe('Language Selection', () => {
    it('should set language and navigate when onSetLanguage is called', () => {
      const newLanguage = mockLanguages[1];
      
      component.onSetLanguage(newLanguage);
      
      expect(i18nService.setDefaultLanguage).toHaveBeenCalledWith(newLanguage);
      expect(routesService.navigateToRoute).toHaveBeenCalledWith(newLanguage.key);
      expect(sharedService.updateUiStatesObjFn).toHaveBeenCalled();
    });

    it('should not set invalid language', () => {
      const invalidLanguage = { key: '', language: '', flag: '' } as Language;
      
      component.onSetLanguage(invalidLanguage);
      
      expect(i18nService.setDefaultLanguage).not.toHaveBeenCalled();
      expect(routesService.navigateToRoute).not.toHaveBeenCalled();
    });

    it('should change selected language when onChangeLanguage is called', () => {
      const newLanguage = mockLanguages[1];
      
      component.onChangeLanguage(newLanguage);
      
      expect(component.selectedLanguage().key).toBe(newLanguage.key);
    });

    it('should identify selected language correctly', () => {
      component['_selectedLanguage'].set(mockLanguages[0]);
      
      expect(component.isLanguageSelected(mockLanguages[0])).toBe(true);
      expect(component.isLanguageSelected(mockLanguages[1])).toBe(false);
    });
  });

  describe('Currency Selection', () => {
    beforeEach(() => {
      component['_selectedLanguage'].set(mockLanguage);
    });

    it('should change currency when valid currency is selected', () => {
      const newCurrency = 'USD';
      
      component.onChangeCurrency(newCurrency);
      
      expect(component.selectedLanguage().defaultCurrency).toBe(newCurrency);
    });

    it('should not change currency when invalid currency is selected', () => {
      const invalidCurrency = 'INVALID';
      const originalCurrency = component.selectedLanguage().defaultCurrency;
      
      component.onChangeCurrency(invalidCurrency);
      
      expect(component.selectedLanguage().defaultCurrency).toBe(originalCurrency);
    });

    it('should identify selected currency correctly', () => {
      expect(component.isCurrencySelected('EUR')).toBe(true);
      expect(component.isCurrencySelected('USD')).toBe(false);
    });
  });

  describe('Menu State Management', () => {
    it('should toggle language menu', () => {
      component.onToggleLanguageMenu();
      
      expect(sharedService.updateUiStatesObjFn).toHaveBeenCalledWith([
        { toggleLanguageMenu: true }
      ]);
    });

    it('should return correct menu state class', () => {
      component['_isMenuOpen'].set(true);
      expect(component.getMenuStateClass()).toBe('show');
      
      component['_isMenuOpen'].set(false);
      expect(component.getMenuStateClass()).toBe('hide');
    });

    it('should return correct slider state class', () => {
      component['_isMenuOpen'].set(true);
      expect(component.getSliderStateClass()).toBe('open');
      
      component['_isMenuOpen'].set(false);
      expect(component.getSliderStateClass()).toBe('closed');
    });
  });

  describe('TrackBy Functions', () => {
    it('should track languages by key', () => {
      const result = component.trackByLanguageKey(0, mockLanguages[0]);
      expect(result).toBe('en');
    });

    it('should track currencies by value', () => {
      const currency = { value: 'EUR' };
      const result = component.trackByCurrencyValue(0, currency);
      expect(result).toBe('EUR');
    });
  });

  describe('Validation', () => {
    it('should validate language objects correctly', () => {
      const validLanguage = mockLanguage;
      const invalidLanguage = { key: '', language: '' } as Language;
      
      expect(component['isValidLanguage'](validLanguage)).toBe(true);
      expect(component['isValidLanguage'](invalidLanguage)).toBe(false);
    });

    it('should validate currency strings correctly', () => {
      component['_selectedLanguage'].set(mockLanguage);
      
      expect(component['isValidCurrency']('EUR')).toBe(true);
      expect(component['isValidCurrency']('INVALID')).toBe(false);
      expect(component['isValidCurrency']('')).toBe(false);
    });
  });

  describe('Computed Properties', () => {
    it('should compute hasSelectedLanguage correctly', () => {
      component['_selectedLanguage'].set(mockLanguage);
      expect(component.hasSelectedLanguage()).toBe(true);
      
      component['_selectedLanguage'].set({} as Language);
      expect(component.hasSelectedLanguage()).toBe(false);
    });

    it('should compute isMenuOpen correctly', () => {
      component['_isMenuOpen'].set(true);
      expect(component.isMenuOpen()).toBe(true);
      
      component['_isMenuOpen'].set(false);
      expect(component.isMenuOpen()).toBe(false);
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
