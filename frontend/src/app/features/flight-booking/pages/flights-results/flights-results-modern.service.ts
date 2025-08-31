import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { 
  BehaviorSubject, 
  Observable, 
  of, 
  throwError,
  combineLatest,
  fromEvent,
  merge,
  EMPTY
} from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  retry,
  shareReplay,
  switchMap,
  tap,
  timeout,
  withLatestFrom
} from 'rxjs/operators';

import { ModernDateService } from 'src/app/core/utils/modern-date.service';
import { DateUtilsFacade } from 'src/app/core/utils/date-utils.facade';
import { FlightsResultsStorageService } from './flights-results-storage.service';
import { 
  DepartureArrival,
  FlightSearchObj,
  FrvlFlightFormat,
  SelectedDates,
  Route,
  DepartureArrivalTime 
} from 'src/app/shared/types/flights-results.type';

export interface FlightFilter {
  priceRange: { min: number; max: number };
  airlines: string[];
  stops: number[];
  departureTime: { start: string; end: string };
  arrivalTime: { start: string; end: string };
  duration: { max: number };
}

export interface FlightSortOption {
  field: 'price' | 'duration' | 'departure' | 'arrival' | 'popularity' | 'stops';
  direction: 'asc' | 'desc';
}

export interface DateFlightOption {
  day: string;
  month: string;
  year: string;
  fullDate: Date;
  minPrice: number;
  currency: string;
  flightCount: number;
}

export interface FlightAnalytics {
  searchId: string;
  searchTime: Date;
  filters: FlightFilter;
  resultsCount: number;
  selectedFlight?: any;
  bookingTime?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FlightsResultsService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly modernDate = inject(ModernDateService);
  private readonly dateUtils = inject(DateUtilsFacade);
  private readonly storage = inject(FlightsResultsStorageService);

  // Signals for reactive state management
  private readonly _allFlights = signal<any[]>([]);
  private readonly _filteredFlights = signal<any[]>([]);
  private readonly _selectedFlight = signal<any>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _selectedDates = signal<SelectedDates>({} as SelectedDates);
  private readonly _filters = signal<FlightFilter>({
    priceRange: { min: 0, max: 10000 },
    airlines: [],
    stops: [],
    departureTime: { start: '00:00', end: '23:59' },
    arrivalTime: { start: '00:00', end: '23:59' },
    duration: { max: 1440 }
  });
  private readonly _sortOption = signal<FlightSortOption>({
    field: 'price',
    direction: 'asc'
  });

  // Legacy BehaviorSubjects for backward compatibility
  public readonly flights$ = new BehaviorSubject<any[]>([]);
  public readonly allFlights$ = new BehaviorSubject<any[]>([]);
  public readonly selectedFlight$ = new BehaviorSubject<any>(null);
  public readonly selectedDates$ = new BehaviorSubject<SelectedDates>({} as SelectedDates);
  public readonly departureBeforeAndAfterFlightsDates$ = new BehaviorSubject<DateFlightOption[]>([]);
  public readonly returnBeforeAfterFlightsDates$ = new BehaviorSubject<DateFlightOption[]>([]);
  public readonly filtersState$ = new BehaviorSubject<string>('closed');
  
  // Additional signals for ±3 days functionality
  private readonly _departureAlternatives = signal<DateFlightOption[]>([]);
  private readonly _returnAlternatives = signal<DateFlightOption[]>([]);
  private readonly _selectedDepartureDate = signal<Date | null>(null);
  private readonly _selectedReturnDate = signal<Date | null>(null);
  
  public readonly departureAlternatives = this._departureAlternatives.asReadonly();
  public readonly returnAlternatives = this._returnAlternatives.asReadonly();
  public readonly selectedDepartureDate = this._selectedDepartureDate.asReadonly();
  public readonly selectedReturnDate = this._selectedReturnDate.asReadonly();

  // Computed properties using signals
  public readonly allFlights = this._allFlights.asReadonly();
  public readonly filteredFlights = this._filteredFlights.asReadonly();
  public readonly selectedFlight = this._selectedFlight.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly selectedDates = this._selectedDates.asReadonly();
  public readonly filters = this._filters.asReadonly();
  public readonly sortOption = this._sortOption.asReadonly();

  // Computed analytics
  public readonly flightStats = computed(() => {
    const flights = this._allFlights();
    if (!flights.length) return null;

    const prices = flights.map(f => f.price || 0);
    const durations = flights.map(f => f.duration?.total || 0);
    
    return {
      totalFlights: flights.length,
      filteredFlights: this._filteredFlights().length,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
        average: prices.reduce((a, b) => a + b, 0) / prices.length
      },
      durationRange: {
        min: Math.min(...durations),
        max: Math.max(...durations),
        average: durations.reduce((a, b) => a + b, 0) / durations.length
      },
      airlines: [...new Set(flights.map(f => f.airline).filter(Boolean))],
      departureAirports: [...new Set(flights.map(f => f.cityCodeFrom).filter(Boolean))],
      arrivalAirports: [...new Set(flights.map(f => f.cityCodeTo).filter(Boolean))]
    };
  });

  // Computed price distribution for charts
  public readonly priceDistribution = computed(() => {
    const flights = this._filteredFlights();
    const bucketSize = 100;
    const distribution: { [key: string]: number } = {};

    flights.forEach(flight => {
      const price = flight.price || 0;
      const bucket = Math.floor(price / bucketSize) * bucketSize;
      const key = `${bucket}-${bucket + bucketSize}`;
      distribution[key] = (distribution[key] || 0) + 1;
    });

    return Object.entries(distribution).map(([range, count]) => ({
      range,
      count,
      percentage: (count / flights.length) * 100
    }));
  });

  // Analytics tracking
  private analytics: FlightAnalytics[] = [];

  constructor() {
    // Sync signals with legacy BehaviorSubjects for backward compatibility
    this._allFlights.subscribe(flights => {
      this.flights$.next(flights);
      this.allFlights$.next(flights);
    });
    
    this._selectedFlight.subscribe(flight => {
      this.selectedFlight$.next(flight);
    });
    
    this._selectedDates.subscribe(dates => {
      this.selectedDates$.next(dates);
    });

    // Auto-filter flights when filters or sort options change
    combineLatest([
      this._allFlights,
      this._filters,
      this._sortOption
    ]).subscribe(([flights, filters, sortOption]) => {
      const filtered = this.applyFiltersAndSort(flights, filters, sortOption);
      this._filteredFlights.set(filtered);
    });

    // Cache filtered flights for performance
    this._filteredFlights.subscribe(flights => {
      this.storage.cacheFlightResults(flights);
    });
  }

  // Modern flight search method with ±3 days support
  public async searchFlights(searchObj: FlightSearchObj): Promise<void> {
    const searchId = this.generateSearchId();
    
    try {
      this._isLoading.set(true);
      this._error.set(null);

      // Set selected dates for tracking
      this._selectedDepartureDate.set(new Date(searchObj.dateFrom));
      if (!searchObj.isFlightTypeOneWay && searchObj.dateTo) {
        this._selectedReturnDate.set(new Date(searchObj.dateTo));
      }

      // Track search analytics
      const analytics: FlightAnalytics = {
        searchId,
        searchTime: new Date(),
        filters: this._filters(),
        resultsCount: 0
      };

      // Try to get cached results first
      const cachedResults = await this.storage.getCachedFlightResults(searchObj);
      if (cachedResults && this.isCacheValid(cachedResults.timestamp)) {
        this.processFlightResults(cachedResults.data, searchObj);
        analytics.resultsCount = cachedResults.data.length;
        this.analytics.push(analytics);
        return;
      }

      // Perform search for main dates + alternative dates (±3 days)
      const searchPromises = await this.createExtendedSearchPromises(searchObj);
      const results = await Promise.all(searchPromises);
      
      // Process main results and alternative dates
      const mainResults = results[0] || [];
      const alternativeResults = results.slice(1);
      
      this.processFlightResults(mainResults, searchObj);
      this.processAlternativeDateResults(alternativeResults, searchObj);
      
      // Cache results
      await this.storage.cacheFlightResults(mainResults, searchObj);

      analytics.resultsCount = mainResults.length;
      this.analytics.push(analytics);
      
    } catch (error) {
      console.error('Flight search failed:', error);
      this._error.set(this.getErrorMessage(error));
      
      // Try to load previous results as fallback
      const fallbackResults = await this.storage.getLastValidResults();
      if (fallbackResults) {
        this.processFlightResults(fallbackResults, searchObj);
        this._error.set('Using cached results due to search error');
      }
    } finally {
      this._isLoading.set(false);
    }
  }

  // Create search promises for main date + alternative dates
  private async createExtendedSearchPromises(searchObj: FlightSearchObj): Promise<Promise<any[]>[]> {
    const promises: Promise<any[]>[] = [];
    
    // Main search
    promises.push(this.performFlightSearch(searchObj).toPromise());

    // Alternative departure dates (±3 days)
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue; // Skip main date
      
      const alternativeDate = new Date(searchObj.dateFrom);
      alternativeDate.setDate(alternativeDate.getDate() + i);
      
      const altSearchObj = {
        ...searchObj,
        dateFrom: alternativeDate.getTime()
      };
      
      promises.push(
        this.performFlightSearch(altSearchObj)
          .toPromise()
          .catch(() => []) // Don't fail entire search if alternative dates fail
      );
    }

    // Alternative return dates (±3 days) for round-trip flights
    if (!searchObj.isFlightTypeOneWay && searchObj.dateTo) {
      for (let i = -3; i <= 3; i++) {
        if (i === 0) continue; // Skip main date
        
        const alternativeReturnDate = new Date(searchObj.dateTo);
        alternativeReturnDate.setDate(alternativeReturnDate.getDate() + i);
        
        const altSearchObj = {
          ...searchObj,
          dateTo: alternativeReturnDate.getTime()
        };
        
        promises.push(
          this.performFlightSearch(altSearchObj)
            .toPromise()
            .catch(() => []) // Don't fail entire search if alternative dates fail
        );
      }
    }

    return promises;
  }

  private performFlightSearch(searchObj: FlightSearchObj): Observable<any[]> {
    const searchUrl = this.buildSearchUrl(searchObj);
    
    return this.http.get<any>(searchUrl).pipe(
      timeout(30000), // 30 second timeout
      retry({
        count: 3,
        delay: (error, retryCount) => {
          console.warn(`Flight search attempt ${retryCount} failed:`, error);
          return of(null).pipe(debounceTime(1000 * retryCount)); // Exponential backoff
        }
      }),
      map(response => response?.data || []),
      catchError(this.handleSearchError.bind(this)),
      shareReplay(1)
    );
  }

  private buildSearchUrl(searchObj: FlightSearchObj): string {
    const params = new URLSearchParams({
      fly_from: searchObj.departureCity.id,
      fly_to: searchObj.destinationCity.id,
      date_from: this.modernDate.format(new Date(searchObj.dateFrom), 'dd/MM/yyyy'),
      date_to: this.modernDate.format(new Date(searchObj.dateTo), 'dd/MM/yyyy'),
      flight_type: searchObj.isFlightTypeOneWay ? 'oneway' : 'round',
      adults: searchObj.infoSerialized.adults.toString(),
      children: searchObj.infoSerialized.children.toString(),
      infants: searchObj.infoSerialized.infants.toString(),
      selected_cabins: searchObj.cabinClass,
      curr: searchObj.defaultLanguage.defaultCurrency,
      locale: searchObj.defaultLanguage.key,
      partner: 'picky'
    });

    return `https://api.tequila.kiwi.com/v2/search?${params.toString()}`;
  }

  private processFlightResults(results: any[], searchObj?: FlightSearchObj): void {
    // Enhanced flight data processing with modern date handling
    const processedFlights = results.map(flight => {
      const processed = {
        ...flight,
        _frvlDateConverted: this.convertFlightDates(flight),
        _pricePerPerson: this.calculatePricePerPerson(flight),
        _isNextDay: this.checkIsNextDay(flight),
        _duration: this.calculateDuration(flight),
        _stops: this.calculateStops(flight),
        _airline: this.getAirlineInfo(flight),
        _route: this.processRouteInfo(flight)
      };
      
      return processed;
    });

    this._allFlights.set(processedFlights);
    
    // Update date-based flight suggestions with main search date
    if (searchObj) {
      this.updateDepartureReturnSuggestions(processedFlights, searchObj);
    } else {
      this.updateDepartureReturnSuggestions(processedFlights);
    }
  }

  // Process alternative date results for ±3 days functionality
  private processAlternativeDateResults(alternativeResults: any[][], searchObj: FlightSearchObj): void {
    const departureAlternatives: DateFlightOption[] = [];
    const returnAlternatives: DateFlightOption[] = [];
    
    let alternativeIndex = 0;
    
    // Process departure alternatives (±3 days)
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue; // Skip main date
      
      const alternativeDate = new Date(searchObj.dateFrom);
      alternativeDate.setDate(alternativeDate.getDate() + i);
      
      const results = alternativeResults[alternativeIndex] || [];
      alternativeIndex++;
      
      if (results.length > 0) {
        const minPriceFlight = results.reduce((min, flight) => 
          flight.price < min.price ? flight : min
        );
        
        departureAlternatives.push({
          day: this.modernDate.format(alternativeDate, 'dd'),
          month: this.modernDate.format(alternativeDate, 'MMM'),
          year: this.modernDate.format(alternativeDate, 'yyyy'),
          fullDate: alternativeDate,
          minPrice: minPriceFlight.price,
          currency: minPriceFlight.currency || 'EUR',
          flightCount: results.length
        });
      }
    }

    // Process return alternatives (±3 days) for round-trip flights
    if (!searchObj.isFlightTypeOneWay && searchObj.dateTo) {
      for (let i = -3; i <= 3; i++) {
        if (i === 0) continue; // Skip main date
        
        const alternativeReturnDate = new Date(searchObj.dateTo);
        alternativeReturnDate.setDate(alternativeReturnDate.getDate() + i);
        
        const results = alternativeResults[alternativeIndex] || [];
        alternativeIndex++;
        
        if (results.length > 0) {
          const minPriceFlight = results.reduce((min, flight) => 
            flight.price < min.price ? flight : min
          );
          
          returnAlternatives.push({
            day: this.modernDate.format(alternativeReturnDate, 'dd'),
            month: this.modernDate.format(alternativeReturnDate, 'MMM'),
            year: this.modernDate.format(alternativeReturnDate, 'yyyy'),
            fullDate: alternativeReturnDate,
            minPrice: minPriceFlight.price,
            currency: minPriceFlight.currency || 'EUR',
            flightCount: results.length
          });
        }
      }
    }

    // Sort alternatives by date
    departureAlternatives.sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
    returnAlternatives.sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());

    // Update signals and legacy observables
    this._departureAlternatives.set(departureAlternatives);
    this._returnAlternatives.set(returnAlternatives);
    this.departureBeforeAndAfterFlightsDates$.next(departureAlternatives);
    this.returnBeforeAfterFlightsDates$.next(returnAlternatives);
  }

  private convertFlightDates(flight: any): DepartureArrival {
    const departureDate = new Date(flight.local_departure);
    const arrivalDate = new Date(flight.local_arrival);

    return {
      departure: {
        time: this.createTimeObject(departureDate, flight.duration?.departure || 0),
        route: flight.route?.slice(0, Math.ceil(flight.route.length / 2)) || []
      },
      arrival: flight.return ? {
        time: this.createTimeObject(arrivalDate, flight.duration?.return || 0),
        route: flight.route?.slice(Math.ceil(flight.route.length / 2)) || []
      } : undefined
    };
  }

  private createTimeObject(date: Date, duration: number): DepartureArrivalTime {
    return {
      day: this.modernDate.format(date, 'dd'),
      month: this.modernDate.format(date, 'MMM'),
      year: this.modernDate.format(date, 'yyyy'),
      fullDate: date,
      duration: this.modernDate.formatDuration(duration * 60000), // Convert minutes to milliseconds
      hoursDepartureFrom: this.modernDate.format(date, 'HH:mm'),
      hoursDepartureTo: this.modernDate.format(
        this.modernDate.addMinutes(date, duration), 
        'HH:mm'
      )
    };
  }

  private calculatePricePerPerson(flight: any): number {
    const totalPersons = (flight.adults || 1) + (flight.children || 0) + (flight.infants || 0);
    return totalPersons > 0 ? flight.price / totalPersons : flight.price;
  }

  private checkIsNextDay(flight: any): boolean {
    const departure = new Date(flight.local_departure);
    const arrival = new Date(flight.local_arrival);
    return !this.modernDate.isSameDay(departure, arrival);
  }

  private calculateDuration(flight: any): { total: number; departure: number; return: number } {
    return {
      total: flight.duration?.total || 0,
      departure: flight.duration?.departure || 0,
      return: flight.duration?.return || 0
    };
  }

  private calculateStops(flight: any): number {
    return (flight.route?.length || 1) - 1;
  }

  private getAirlineInfo(flight: any): any {
    return {
      name: flight.airlines?.[0] || 'Unknown',
      code: flight.route?.[0]?.airline || 'XX'
    };
  }

  private processRouteInfo(flight: any): Route[] {
    return (flight.route || []).map((segment: any) => ({
      ...segment,
      isNextDay: this.checkIsNextDay(segment),
      waitingTime: this.calculateWaitingTime(segment)
    }));
  }

  private calculateWaitingTime(segment: any): string {
    // Calculate waiting time between flights
    return '0h 0m'; // Placeholder
  }

  // Advanced filtering and sorting
  private applyFiltersAndSort(
    flights: any[], 
    filters: FlightFilter, 
    sortOption: FlightSortOption
  ): any[] {
    let filtered = [...flights];

    // Apply price filter
    filtered = filtered.filter(flight => 
      flight.price >= filters.priceRange.min && flight.price <= filters.priceRange.max
    );

    // Apply airline filter
    if (filters.airlines.length > 0) {
      filtered = filtered.filter(flight => 
        filters.airlines.includes(flight._airline?.name || flight.airlines?.[0])
      );
    }

    // Apply stops filter
    if (filters.stops.length > 0) {
      filtered = filtered.filter(flight => 
        filters.stops.includes(flight._stops)
      );
    }

    // Apply time filters
    filtered = filtered.filter(flight => {
      const departureTime = this.modernDate.format(new Date(flight.local_departure), 'HH:mm');
      const arrivalTime = this.modernDate.format(new Date(flight.local_arrival), 'HH:mm');
      
      return departureTime >= filters.departureTime.start &&
             departureTime <= filters.departureTime.end &&
             arrivalTime >= filters.arrivalTime.start &&
             arrivalTime <= filters.arrivalTime.end;
    });

    // Apply duration filter
    filtered = filtered.filter(flight => 
      (flight._duration?.total || 0) <= filters.duration.max
    );

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortOption.field) {
        case 'price':
          comparison = (a.price || 0) - (b.price || 0);
          break;
        case 'duration':
          comparison = (a._duration?.total || 0) - (b._duration?.total || 0);
          break;
        case 'departure':
          comparison = new Date(a.local_departure).getTime() - new Date(b.local_departure).getTime();
          break;
        case 'arrival':
          comparison = new Date(a.local_arrival).getTime() - new Date(b.local_arrival).getTime();
          break;
        case 'popularity':
          comparison = (b.popularity_score || 0) - (a.popularity_score || 0);
          break;
      }
      
      return sortOption.direction === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }

  // Public methods for updating state
  public updateFilters(filters: Partial<FlightFilter>): void {
    this._filters.update(current => ({ ...current, ...filters }));
  }

  public updateSort(sortOption: FlightSortOption): void {
    this._sortOption.set(sortOption);
  }

  public selectFlight(flight: any): void {
    this._selectedFlight.set(flight);
    
    // Track selection in analytics
    const currentAnalytics = this.analytics[this.analytics.length - 1];
    if (currentAnalytics) {
      currentAnalytics.selectedFlight = flight;
      currentAnalytics.bookingTime = new Date();
    }
  }

  public updateSelectedDates(dates: SelectedDates): void {
    this._selectedDates.set(dates);
  }

  // Legacy method for backward compatibility
  public aggregateFlights(): void {
    // This method is called by the legacy component
    // The actual work is now done in searchFlights()
    console.log('aggregateFlights called - using modern searchFlights instead');
  }

  private updateDepartureReturnSuggestions(flights: any[], searchObj?: FlightSearchObj): void {
    // Create suggestions for different departure/return dates with prices
    const departureSuggestions = this.createDateSuggestions(flights, 'departure');
    const returnSuggestions = this.createDateSuggestions(flights, 'return');

    // If we have search object, add the main selected date info
    if (searchObj) {
      const mainDepartureDate = new Date(searchObj.dateFrom);
      const mainDepartureSuggestion = {
        day: this.modernDate.format(mainDepartureDate, 'dd'),
        month: this.modernDate.format(mainDepartureDate, 'MMM'),
        year: this.modernDate.format(mainDepartureDate, 'yyyy'),
        fullDate: mainDepartureDate,
        minPrice: flights.length > 0 ? Math.min(...flights.map(f => f.price)) : 0,
        currency: flights.length > 0 ? flights[0].currency || 'EUR' : 'EUR',
        flightCount: flights.length,
        isSelected: true
      };

      // Insert main date in the right position
      departureSuggestions.push(mainDepartureSuggestion);
      departureSuggestions.sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());

      if (!searchObj.isFlightTypeOneWay && searchObj.dateTo) {
        const mainReturnDate = new Date(searchObj.dateTo);
        const mainReturnSuggestion = {
          day: this.modernDate.format(mainReturnDate, 'dd'),
          month: this.modernDate.format(mainReturnDate, 'MMM'),
          year: this.modernDate.format(mainReturnDate, 'yyyy'),
          fullDate: mainReturnDate,
          minPrice: flights.length > 0 ? Math.min(...flights.map(f => f.price)) : 0,
          currency: flights.length > 0 ? flights[0].currency || 'EUR' : 'EUR',
          flightCount: flights.length,
          isSelected: true
        };

        returnSuggestions.push(mainReturnSuggestion);
        returnSuggestions.sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
      }
    }

    this.departureBeforeAndAfterFlightsDates$.next(departureSuggestions);
    this.returnBeforeAfterFlightsDates$.next(returnSuggestions);
  }

  private createDateSuggestions(flights: any[], type: 'departure' | 'return'): any[] {
    const dateMap = new Map();
    
    flights.forEach(flight => {
      const date = type === 'departure' ? 
        new Date(flight.local_departure) : 
        new Date(flight.local_arrival);
      
      const key = this.modernDate.format(date, 'dd-MM-yyyy');
      
      if (!dateMap.has(key) || dateMap.get(key).price > flight.price) {
        dateMap.set(key, {
          day: this.modernDate.format(date, 'dd'),
          month: this.modernDate.format(date, 'MMM'),
          minPrice: flight.price,
          curr: flight.currency || 'EUR',
          fullDate: date
        });
      }
    });

    return Array.from(dateMap.values()).sort((a, b) => 
      a.fullDate.getTime() - b.fullDate.getTime()
    );
  }

  // Utility methods
  private generateSearchId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isCacheValid(timestamp: Date): boolean {
    const cacheMaxAge = 15 * 60 * 1000; // 15 minutes
    return Date.now() - timestamp.getTime() < cacheMaxAge;
  }

  private handleSearchError(error: HttpErrorResponse): Observable<any[]> {
    console.error('Flight search error:', error);
    
    let errorMessage = 'An error occurred while searching for flights';
    
    if (error.status === 0) {
      errorMessage = 'Network error - please check your connection';
    } else if (error.status >= 400 && error.status < 500) {
      errorMessage = 'Invalid search parameters';
    } else if (error.status >= 500) {
      errorMessage = 'Flight search service is temporarily unavailable';
    }

    this._error.set(errorMessage);
    return of([]); // Return empty array as fallback
  }

  private getErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error?.message) return error.error.message;
    return 'An unexpected error occurred';
  }

  // Analytics methods
  public getAnalytics(): FlightAnalytics[] {
    return [...this.analytics];
  }

  public clearAnalytics(): void {
    this.analytics = [];
  }

  // Performance monitoring
  public getPerformanceMetrics(): any {
    return {
      totalSearches: this.analytics.length,
      averageResultsCount: this.analytics.reduce((sum, a) => sum + a.resultsCount, 0) / this.analytics.length,
      conversionRate: this.analytics.filter(a => a.selectedFlight).length / this.analytics.length,
      lastSearchTime: this.analytics[this.analytics.length - 1]?.searchTime
    };
  }
}