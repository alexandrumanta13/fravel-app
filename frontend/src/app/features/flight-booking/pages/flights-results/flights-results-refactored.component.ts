import { 
  Component, 
  OnInit, 
  OnDestroy, 
  PLATFORM_ID,
  inject,
  signal,
  computed,
  effect
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { FlightsResultsService, FlightFilter, FlightSortOption } from './flights-results-modern.service';
import { FlightsResultsStorageService } from './flights-results-storage.service';
import { FlightMapComponent } from './map/map.component';
import { LoaderService } from 'src/app/core/services';
import { DateUtilsFacade } from 'src/app/core/utils/date-utils.facade';
import { SelectedDates } from 'src/app/shared/types/flights-results.type';

export interface ViewState {
  showMap: boolean;
  showFilters: boolean;
  viewMode: 'list' | 'grid' | 'map';
  sortBy: 'price' | 'duration' | 'departure' | 'stops';
  sortDirection: 'asc' | 'desc';
}

@Component({
  selector: 'app-flights-results',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatBottomSheetModule,
    TranslateModule,
    FlightMapComponent
  ],
  templateUrl: './flights-results-refactored.component.html',
  styleUrls: ['./flights-results-refactored.component.scss']
})
export class FlightsResultsRefactoredComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly platformId = inject(PLATFORM_ID);
  private readonly flightsService = inject(FlightsResultsService);
  private readonly storageService = inject(FlightsResultsStorageService);
  private readonly loaderService = inject(LoaderService);
  private readonly dateUtils = inject(DateUtilsFacade);
  private readonly translate = inject(TranslateService);

  // Signals for reactive state management
  private readonly _viewState = signal<ViewState>({
    showMap: false,
    showFilters: false,
    viewMode: 'list',
    sortBy: 'price',
    sortDirection: 'asc'
  });

  private readonly _selectedFlight = signal<any>(null);
  private readonly _isScrolled = signal(false);
  private readonly _selectedDates = signal<SelectedDates>({} as SelectedDates);

  // Public readonly signals
  public readonly viewState = this._viewState.asReadonly();
  public readonly selectedFlight = this._selectedFlight.asReadonly();
  public readonly isScrolled = this._isScrolled.asReadonly();
  public readonly selectedDates = this._selectedDates.asReadonly();

  // Service signals
  public readonly flights = this.flightsService.filteredFlights;
  public readonly allFlights = this.flightsService.allFlights;
  public readonly isLoading = this.flightsService.isLoading;
  public readonly error = this.flightsService.error;
  public readonly flightStats = this.flightsService.flightStats;
  public readonly filters = this.flightsService.filters;
  public readonly sortOption = this.flightsService.sortOption;

  // Computed properties
  public readonly hasResults = computed(() => this.flights().length > 0);
  public readonly showEmptyState = computed(() => 
    !this.isLoading() && !this.error() && !this.hasResults()
  );
  public readonly activeFiltersCount = computed(() => {
    const filters = this.filters();
    let count = 0;
    
    if (filters.airlines.length > 0) count++;
    if (filters.stops.length > 0) count++;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) count++;
    if (filters.departureTime.start !== '00:00' || filters.departureTime.end !== '23:59') count++;
    if (filters.duration.max < 1440) count++;
    
    return count;
  });

  // Platform-specific features
  public readonly isBrowser = computed(() => 
    isPlatformBrowser(this.platformId)
  );

  constructor() {
    // React to view state changes
    effect(() => {
      const state = this._viewState();
      const sortOption: FlightSortOption = {
        field: state.sortBy,
        direction: state.sortDirection
      };
      this.flightsService.updateSort(sortOption);
    });

    // Save view preferences
    effect(() => {
      if (this.isBrowser()) {
        const state = this._viewState();
        localStorage.setItem('flightResults_viewState', JSON.stringify(state));
      }
    });
  }

  ngOnInit(): void {
    this.setupScrollListener();
    this.loadViewPreferences();
    this.subscribeToServiceUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupScrollListener(): void {
    if (!this.isBrowser()) return;

    fromEvent(window, 'scroll')
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(16), // ~60fps
        distinctUntilChanged()
      )
      .subscribe(() => {
        const scrolled = window.scrollY > 200;
        this._isScrolled.set(scrolled);
      });
  }

  private loadViewPreferences(): void {
    if (!this.isBrowser()) return;

    const saved = localStorage.getItem('flightResults_viewState');
    if (saved) {
      try {
        const savedState = JSON.parse(saved);
        this._viewState.set({ ...this._viewState(), ...savedState });
      } catch (error) {
        console.warn('Error loading view preferences:', error);
      }
    }
  }

  private subscribeToServiceUpdates(): void {
    // Subscribe to legacy service updates for backward compatibility
    this.flightsService.selectedFlight$
      .pipe(takeUntil(this.destroy$))
      .subscribe(flight => {
        this._selectedFlight.set(flight);
      });

    this.flightsService.selectedDates$
      .pipe(takeUntil(this.destroy$))
      .subscribe(dates => {
        this._selectedDates.set(dates);
      });
  }

  // View actions
  public toggleMap(): void {
    this._viewState.update(state => ({
      ...state,
      showMap: !state.showMap,
      viewMode: state.showMap ? 'list' : 'map'
    }));
  }

  public toggleFilters(): void {
    this._viewState.update(state => ({
      ...state,
      showFilters: !state.showFilters
    }));
  }

  public changeViewMode(mode: 'list' | 'grid' | 'map'): void {
    this._viewState.update(state => ({
      ...state,
      viewMode: mode,
      showMap: mode === 'map'
    }));
  }

  public updateSort(field: 'price' | 'duration' | 'departure' | 'stops'): void {
    this._viewState.update(state => ({
      ...state,
      sortBy: field,
      sortDirection: state.sortBy === field && state.sortDirection === 'asc' ? 'desc' : 'asc'
    }));
  }

  // Flight actions
  public selectFlight(flight: any): void {
    this.flightsService.selectFlight(flight);
    this._selectedFlight.set(flight);
  }

  public bookFlight(flight: any): void {
    this.selectFlight(flight);
    // Navigation logic will be handled by parent component or router
  }

  public compareFlight(flight: any): void {
    // Add flight to comparison
    this.storageService.saveFlightComparison([flight], `Comparison ${new Date().toLocaleString()}`);
  }

  // Filter actions
  public updatePriceFilter(min: number, max: number): void {
    this.flightsService.updateFilters({
      priceRange: { min, max }
    });
  }

  public updateAirlineFilter(airlines: string[]): void {
    this.flightsService.updateFilters({
      airlines
    });
  }

  public updateStopsFilter(stops: number[]): void {
    this.flightsService.updateFilters({
      stops
    });
  }

  public updateTimeFilter(type: 'departure' | 'arrival', start: string, end: string): void {
    if (type === 'departure') {
      this.flightsService.updateFilters({
        departureTime: { start, end }
      });
    } else {
      this.flightsService.updateFilters({
        arrivalTime: { start, end }
      });
    }
  }

  public updateDurationFilter(maxDuration: number): void {
    this.flightsService.updateFilters({
      duration: { max: maxDuration }
    });
  }

  public clearFilters(): void {
    this.flightsService.updateFilters({
      priceRange: { min: 0, max: 10000 },
      airlines: [],
      stops: [],
      departureTime: { start: '00:00', end: '23:59' },
      arrivalTime: { start: '00:00', end: '23:59' },
      duration: { max: 1440 }
    });
  }

  // Date selection
  public changeDate(type: 'departure' | 'return', day: string): void {
    const currentDates = this._selectedDates();
    const updatedDates = { ...currentDates };
    
    if (type === 'departure') {
      updatedDates.departure = { ...updatedDates.departure, day };
    } else {
      updatedDates.arrival = { ...updatedDates.arrival, day };
    }
    
    this._selectedDates.set(updatedDates);
    this.flightsService.updateSelectedDates(updatedDates);
  }

  // Utility methods for templates
  public formatPrice(price: number): string {
    return new Intl.NumberFormat(this.translate.currentLang, {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  public formatDuration(minutes: number): string {
    return this.dateUtils.formatDuration(minutes * 60000);
  }

  public getAirlineName(flight: any): string {
    return flight._airline?.name || flight.airlines?.[0] || 'Unknown Airline';
  }

  public getStopsText(flight: any): string {
    const stops = flight._stops || 0;
    if (stops === 0) {
      return this.translate.instant('FLIGHTS.DIRECT');
    } else if (stops === 1) {
      return this.translate.instant('FLIGHTS.ONE_STOP');
    } else {
      return this.translate.instant('FLIGHTS.STOPS', { count: stops });
    }
  }

  public getDepartureTime(flight: any): string {
    return this.dateUtils.formatTime(new Date(flight.local_departure));
  }

  public getArrivalTime(flight: any): string {
    return this.dateUtils.formatTime(new Date(flight.local_arrival));
  }

  public isNextDay(flight: any): boolean {
    return flight._isNextDay || false;
  }

  // Accessibility helpers
  public getFlightAriaLabel(flight: any): string {
    return this.translate.instant('FLIGHTS.FLIGHT_ARIA_LABEL', {
      airline: this.getAirlineName(flight),
      from: flight.cityFrom,
      to: flight.cityTo,
      departure: this.getDepartureTime(flight),
      arrival: this.getArrivalTime(flight),
      price: this.formatPrice(flight.price),
      stops: this.getStopsText(flight)
    });
  }

  // Track by functions for performance
  public trackByFlightId(index: number, flight: any): string {
    return flight.id || flight.booking_token || index.toString();
  }

  public trackByAirline(index: number, airline: string): string {
    return airline;
  }

  // Alternative dates functionality (±3 days)
  public searchFlightsForDate(date: Date, type: 'departure' | 'return'): void {
    console.log(`Searching flights for ${type} date:`, date);
    // Implementation would trigger a new search with the selected alternative date
    // This would be handled by the parent component or router with navigation
  }

  // Error handling
  public retrySearch(): void {
    // This would trigger a new search based on current parameters
    // Implementation depends on how search parameters are managed
    console.log('Retrying flight search...');
  }

  public reportError(): void {
    // Send error report to analytics or logging service
    console.log('Reporting error to support...');
  }
}