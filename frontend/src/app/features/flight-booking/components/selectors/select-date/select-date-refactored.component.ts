import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, effect, signal, computed, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule, DateAdapter } from '@angular/material/core';
import { SharedService } from 'src/app/shared/shared.service';
import { ModernDateService } from 'src/app/core/utils/modern-date.service';

export interface FlightDateSelection {
  departure: Date;
  return?: Date;
}

export type FlightType = 'oneWay' | 'roundTrip';

@Component({
  standalone: true,
  selector: 'app-select-date-refactored',
  templateUrl: './select-date-refactored.component.html',
  styleUrls: ['./select-date-refactored.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatIconModule,
    MatNativeDateModule,
  ],
})
export class SelectDateRefactoredComponent implements OnInit {
  // ========================
  // REACTIVE STATE MANAGEMENT
  // ========================
  
  // UI State
  toggleMenu = signal(false);
  toggleFilter = signal(false);
  toggleSearchFlight = signal(false);
  isLoading = signal(false);
  
  // Flight Configuration
  flightType = signal<FlightType>('roundTrip');
  
  // Date Selection
  selectedDeparture = signal<Date | null>(null);
  selectedReturn = signal<Date | null>(null);
  
  // Validation
  validationErrors = signal<string[]>([]);
  
  // Form Controls
  dateForm = new FormGroup({
    departure: new FormControl<Date | null>(null, [Validators.required]),
    return: new FormControl<Date | null>(null),
  });
  
  // ========================
  // COMPUTED VALUES
  // ========================
  
  // Minimum dates
  minDepartureDate = computed(() => this.modernDateService.startOfDay(new Date()));
  minReturnDate = computed(() => {
    const departure = this.selectedDeparture();
    return departure ? this.modernDateService.startOfDay(departure) : this.minDepartureDate();
  });
  
  // Maximum reasonable date (1 year from now)
  maxDate = computed(() => this.modernDateService.addDays(new Date(), 365));
  
  // Form validation state
  canProceed = computed(() => {
    const departure = this.selectedDeparture();
    const returnDate = this.selectedReturn();
    const isOneWay = this.flightType() === 'oneWay';
    
    return departure !== null && (isOneWay || returnDate !== null);
  });
  
  // Formatted display dates
  formattedDeparture = computed(() => {
    const date = this.selectedDeparture();
    return date ? this.modernDateService.formatForDisplay(date) : '';
  });
  
  formattedReturn = computed(() => {
    const date = this.selectedReturn();
    return date ? this.modernDateService.formatForDisplay(date) : '';
  });
  
  // Trip duration
  tripDuration = computed(() => {
    const departure = this.selectedDeparture();
    const returnDate = this.selectedReturn();
    
    if (!departure || !returnDate || this.flightType() === 'oneWay') {
      return null;
    }
    
    const days = this.modernDateService.differenceInDays(departure, returnDate);
    return days === 1 ? '1 zi' : `${days} zile`;
  });

  constructor(
    private sharedService: SharedService,
    private modernDateService: ModernDateService,
    private dateAdapter: DateAdapter<Date>,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Set locale pentru date picker
    this.dateAdapter.setLocale('ro-RO');
    
    if (isPlatformBrowser(this.platformId)) {
      // Sync with SharedService state
      effect(() => {
        this.toggleMenu.set(this.sharedService.uiState().toggleMenu);
        this.toggleFilter.set(this.sharedService.uiState().toggleFilter);
        this.toggleSearchFlight.set(this.sharedService.uiState().toggleSearchFlight);
        
        // Sync flight type
        const isOneWay = this.sharedService.flightSearch().isFlightTypeOneWay;
        this.flightType.set(isOneWay ? 'oneWay' : 'roundTrip');
      });
    }
  }

  ngOnInit() {
    this.setupFormSubscriptions();
    this.initializeDefaults();
  }

  // ========================
  // INITIALIZATION
  // ========================
  
  private setupFormSubscriptions() {
    // Sync form controls with signals
    this.dateForm.get('departure')?.valueChanges.subscribe(date => {
      this.selectedDeparture.set(date);
      this.validateDates();
    });
    
    this.dateForm.get('return')?.valueChanges.subscribe(date => {
      this.selectedReturn.set(date);
      this.validateDates();
    });
  }
  
  private initializeDefaults() {
    // Set default departure to tomorrow
    const defaultDeparture = this.modernDateService.addDays(new Date(), 1);
    this.dateForm.patchValue({
      departure: defaultDeparture,
    });
    
    // Set default return for round trip (1 week later)
    if (this.flightType() === 'roundTrip') {
      const defaultReturn = this.modernDateService.addDays(defaultDeparture, 7);
      this.dateForm.patchValue({
        return: defaultReturn,
      });
    }
  }

  // ========================
  // DATE SELECTION LOGIC
  // ========================
  
  onDepartureSelected(date: Date | null) {
    if (!date) return;
    
    this.selectedDeparture.set(date);
    
    // Auto-adjust return date if it's before departure
    const currentReturn = this.selectedReturn();
    if (currentReturn && this.modernDateService.startOfDay(currentReturn) < this.modernDateService.startOfDay(date)) {
      const newReturn = this.modernDateService.addDays(date, 1);
      this.dateForm.patchValue({ return: newReturn });
    }
    
    this.updateSharedService();
  }
  
  onReturnSelected(date: Date | null) {
    this.selectedReturn.set(date);
    this.updateSharedService();
  }

  // ========================
  // FLIGHT TYPE MANAGEMENT
  // ========================
  
  toggleFlightType() {
    const newType = this.flightType() === 'oneWay' ? 'roundTrip' : 'oneWay';
    this.flightType.set(newType);
    
    if (newType === 'oneWay') {
      // Clear return date for one-way
      this.dateForm.patchValue({ return: null });
      this.selectedReturn.set(null);
    } else {
      // Set default return date for round trip
      const departure = this.selectedDeparture();
      if (departure) {
        const defaultReturn = this.modernDateService.addDays(departure, 7);
        this.dateForm.patchValue({ return: defaultReturn });
      }
    }
    
    // Update SharedService
    this.sharedService.updateFlightObjFn('isFlightTypeOneWay', newType === 'oneWay');
    this.updateSharedService();
  }

  // ========================
  // VALIDATION
  // ========================
  
  private validateDates() {
    const departure = this.selectedDeparture();
    const returnDate = this.selectedReturn();
    
    if (!departure) {
      this.validationErrors.set(['Selectează data de plecare']);
      return;
    }
    
    const validation = this.modernDateService.validateDateRange(departure, returnDate || undefined);
    this.validationErrors.set(validation.errors);
    
    // Additional business rules
    const errors = [...validation.errors];
    
    // Check if departure is too far in advance (max 11 months for airlines)
    const monthsInAdvance = this.modernDateService.differenceInDays(new Date(), departure) / 30;
    if (monthsInAdvance > 11) {
      errors.push('Rezervările se pot face cu maximum 11 luni în avans');
    }
    
    // Check if return trip is too short (minimum 1 day)
    if (returnDate && this.flightType() === 'roundTrip') {
      const tripDays = this.modernDateService.differenceInDays(departure, returnDate);
      if (tripDays === 0) {
        errors.push('Călătoria trebuie să dureze cel puțin o zi');
      }
    }
    
    this.validationErrors.set(errors);
  }

  // ========================
  // DATE FILTERS FOR CALENDAR
  // ========================
  
  departureFilter = (date: Date | null): boolean => {
    if (!date) return false;
    
    const today = this.modernDateService.startOfDay(new Date());
    const targetDate = this.modernDateService.startOfDay(date);
    const maxDate = this.modernDateService.addDays(today, 330); // ~11 months
    
    return targetDate >= today && targetDate <= maxDate;
  };
  
  returnFilter = (date: Date | null): boolean => {
    if (!date) return false;
    
    const departure = this.selectedDeparture();
    if (!departure) return this.departureFilter(date);
    
    const minReturn = this.modernDateService.startOfDay(departure);
    const targetDate = this.modernDateService.startOfDay(date);
    const maxDate = this.modernDateService.addDays(minReturn, 365);
    
    return targetDate >= minReturn && targetDate <= maxDate;
  };

  // ========================
  // QUICK DATE SELECTION
  // ========================
  
  selectTomorrow() {
    const tomorrow = this.modernDateService.addDays(new Date(), 1);
    this.dateForm.patchValue({ departure: tomorrow });
  }
  
  selectNextWeekend() {
    const today = new Date();
    const daysUntilSaturday = (6 - today.getDay()) % 7;
    const nextSaturday = this.modernDateService.addDays(today, daysUntilSaturday === 0 ? 7 : daysUntilSaturday);
    
    this.dateForm.patchValue({ 
      departure: nextSaturday,
      return: this.flightType() === 'roundTrip' ? this.modernDateService.addDays(nextSaturday, 1) : null
    });
  }
  
  selectWeekTrip() {
    const departure = this.selectedDeparture() || this.modernDateService.addDays(new Date(), 1);
    const returnDate = this.modernDateService.addDays(departure, 7);
    
    this.dateForm.patchValue({
      departure,
      return: returnDate
    });
    
    if (this.flightType() === 'oneWay') {
      this.toggleFlightType();
    }
  }

  // ========================
  // SHARED SERVICE INTEGRATION
  // ========================
  
  private updateSharedService() {
    const departure = this.selectedDeparture();
    const returnDate = this.selectedReturn();
    
    if (departure) {
      this.sharedService.updateFlightObjFn('dateFrom', departure.getTime());
      
      if (returnDate && this.flightType() === 'roundTrip') {
        this.sharedService.updateFlightObjFn('dateTo', returnDate.getTime());
      } else {
        this.sharedService.updateFlightObjFn('dateTo', 0);
      }
      
      this.sharedService.daysToAddFn();
    }
  }

  // ========================
  // UI ACTIONS
  // ========================
  
  proceedToNext() {
    if (!this.canProceed()) {
      this.validateDates();
      return;
    }
    
    this.updateSharedService();
    this.sharedService.updateUiStatesObjFn([{ toggleSearchFlight: true }]);
    this.sharedService.setStepFn(4); // Next step in booking flow
  }
  
  goBack() {
    this.sharedService.updateUiStatesObjFn([{ toggleSelectDate: false }]);
  }

  // ========================
  // UTILITY METHODS
  // ========================
  
  getFlightTypeLabel(): string {
    return this.flightType() === 'oneWay' ? 'Doar dus' : 'Dus-întors';
  }
  
  getDepartureWeekday(): string {
    const date = this.selectedDeparture();
    if (!date) return '';
    
    return this.modernDateService.formatDate(date, {
      weekday: 'long',
    });
  }
  
  getReturnWeekday(): string {
    const date = this.selectedReturn();
    if (!date) return '';
    
    return this.modernDateService.formatDate(date, {
      weekday: 'long',
    });
  }
}