import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  effect,
  computed,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { Language, Languages } from '../../../../core/types';
import { I18nService } from './i18n.service';
import { SharedService } from '../../../shared.service';
import { languages } from '../../../../core/providers/languages';
import { I18nRoutingService } from '../../../../core/services/i18n-routing.service';

@Component({
  standalone: true,
  selector: 'app-i18n',
  templateUrl: './i18n.component.html',
  styleUrls: ['./i18n.component.scss'],
  imports: [CommonModule],
})
export class I18nComponent implements OnInit, OnDestroy {
  // Static data
  readonly availableLanguages: Languages[] = languages;
  
  // Internal signals
  private readonly _isMenuOpen = signal(false);
  private readonly _selectedLanguage = signal({} as Language);
  
  // Computed properties
  readonly isMenuOpen = computed(() => this._isMenuOpen());
  readonly selectedLanguage = computed(() => this._selectedLanguage());
  readonly hasSelectedLanguage = computed(() => 
    Object.keys(this._selectedLanguage()).length > 0
  );
  
  // Destroy subject for cleanup
  private readonly destroy$ = new Subject<void>();

  constructor(
    private sharedService: SharedService,
    private i18nService: I18nService,
    private i18nRoutingService: I18nRoutingService,
    private translateService: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Setup reactive sync with shared service
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        this.syncWithSharedService();
      });
    }
    
    // Initialize with current language
    this.initializeLanguage();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Public methods
  onSetLanguage(language: Language): void {
    if (this.isValidLanguage(language)) {
      this.toggleLanguageMenu();
      this.i18nService.setDefaultLanguage(language);
      
      // Use the new i18n routing service to switch language and update URL
      this.i18nRoutingService.switchLanguage(language.key);
      this.translateService.use(language.key);
      
      this.updateSelectedLanguage(language);
    }
  }

  onToggleLanguageMenu(): void {
    this.toggleLanguageMenu();
  }

  onChangeLanguage(language: Language): void {
    if (this.isValidLanguage(language)) {
      this.updateSelectedLanguage(language);
    }
  }

  onChangeCurrency(currency: string): void {
    if (this.isValidCurrency(currency)) {
      const updatedLanguage = {
        ...this._selectedLanguage(),
        defaultCurrency: currency
      };
      this.updateSelectedLanguage(updatedLanguage);
    }
  }

  // Utility methods for template
  trackByLanguageKey(_index: number, language: Languages): string {
    return language.key;
  }

  trackByCurrencyValue(_index: number, currency: { value: string }): string {
    return currency.value;
  }

  getMenuStateClass(): string {
    return this._isMenuOpen() ? 'show' : 'hide';
  }

  getSliderStateClass(): string {
    return this._isMenuOpen() ? 'open' : 'closed';
  }

  isLanguageSelected(language: Languages): boolean {
    return this._selectedLanguage().key === language.key;
  }

  isCurrencySelected(currency: string): boolean {
    return currency === this._selectedLanguage().defaultCurrency;
  }

  // Private methods
  private syncWithSharedService(): void {
    const uiState = this.sharedService.uiState();
    const flightSearch = this.sharedService.flightSearch();

    this._isMenuOpen.set(uiState.toggleLanguageMenu);
    
    if (Object.keys(flightSearch.defaultLanguage || {}).length > 0) {
      this._selectedLanguage.set(flightSearch.defaultLanguage);
    }
  }

  private initializeLanguage(): void {
    const defaultLanguage = this.i18nService.checkLanguage();
    if (Object.keys(defaultLanguage).length > 0) {
      this._selectedLanguage.set(defaultLanguage);
    }
  }

  private toggleLanguageMenu(): void {
    const newState = !this._isMenuOpen();
    this._isMenuOpen.set(newState);
    
    this.sharedService.updateUiStatesObjFn([
      { toggleLanguageMenu: newState }
    ]);
  }

  private updateSelectedLanguage(language: Language): void {
    this._selectedLanguage.set(language);
    
    // Update shared service if needed
    this.sharedService.updateFlightObjFn('defaultLanguage', language);
  }

  private isValidLanguage(language: Language): boolean {
    return language && 
           typeof language.key === 'string' && 
           language.key.length > 0;
  }

  private isValidCurrency(currency: string): boolean {
    return typeof currency === 'string' && 
           currency.length > 0 && 
           this._selectedLanguage().currency?.some((c: { value: string }) => c.value === currency);
  }
}
