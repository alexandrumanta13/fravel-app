import { Component, Inject, PLATFORM_ID, effect, OnInit, OnDestroy } from '@angular/core';

import { Airport, Airports, ConvertedAirport, AirportGroup } from 'src/app/shared/types';

import { isPlatformBrowser } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedService } from 'src/app/shared/shared.service';
import { AirportsService } from 'src/app/core/services/airports/airports.service';
import { BackendAirportsService } from 'src/app/core/services/airports/backend-airports.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-select-departure',
  templateUrl: './select-departure.component.html',
  styleUrls: ['./select-departure.component.scss'],
  imports: [SharedModule],
})
export class SelectDepartureComponent implements OnInit, OnDestroy {
  screenHeight: number = 0;
  screenWidth: number = 0;
  toggleMenu: boolean = false;
  departure: string = '';
  airports: Airports[] = [];
  departureCity: Airport = {} as Airport;
  
  // Enhanced properties
  isLoading: boolean = false;
  searchError: string = '';
  recentSearches: string[] = [];
  popularDestinations: ConvertedAirport[] = [];
  serviceMode: 'backend' | 'legacy' = 'legacy';
  
  // RxJS subjects for cleanup and search debouncing
  private destroy$ = new Subject<void>();
  private searchTerms = new Subject<string>();

  constructor(
    private _SharedService: SharedService,
    private _AirportsService: AirportsService,
    private backendAirportsService: BackendAirportsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        this.toggleMenu = this._SharedService.uiState().toggleMenu;
        this.screenHeight = this._SharedService.uiState().screenHeight;
        this.screenWidth = this._SharedService.uiState().screenWidth;
        this.airports = this._SharedService.departureAirports();
        this.departureCity = this._SharedService.flightSearch().departureCity;
      });
    }
  }

  ngOnInit() {
    this.initializeComponent();
    this.setupSearchDebouncing();
    this.loadRecentSearches();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async initializeComponent() {
    if (isPlatformBrowser(this.platformId)) {
      // Auto-configure service based on backend availability
      await this._AirportsService.autoConfigureService();
      this.serviceMode = this._AirportsService.getCurrentServiceMode();
      
      // Load popular destinations for empty state
      await this.loadPopularDestinations();
    }
  }

  private setupSearchDebouncing() {
    this.searchTerms.pipe(
      debounceTime(300), // Wait 300ms after user stops typing
      distinctUntilChanged(), // Only search if term changed
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.performSearch(term);
    });
  }

  private async loadPopularDestinations() {
    try {
      if (this.serviceMode === 'backend') {
        const response = await this.backendAirportsService.universalSearch('', {
          limit: 10,
          sortBy: 'relevance'
        });
        
        this.popularDestinations = [
          ...response.airports.map(airport => this.backendAirportsService.convertBackendAirportToLegacy(airport)),
          ...response.cities.map(city => this.backendAirportsService.convertBackendCityToLegacy(city))
        ].slice(0, 8);
      }
    } catch (error) {
      console.warn('Failed to load popular destinations:', error);
    }
  }

  private loadRecentSearches() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('recentDepartureSearches');
      if (stored) {
        this.recentSearches = JSON.parse(stored).slice(0, 5);
      }
    }
  }

  private saveRecentSearch(term: string) {
    if (isPlatformBrowser(this.platformId) && term.length > 0) {
      const recent = [term, ...this.recentSearches.filter(s => s !== term)].slice(0, 5);
      this.recentSearches = recent;
      localStorage.setItem('recentDepartureSearches', JSON.stringify(recent));
    }
  }

  searchDeparture() {
    const term = this.departure.trim();
    if (term.length > 0) {
      this.searchTerms.next(term);
    } else {
      // Clear results when search is empty
      this._SharedService.setSearchDepartureAirportsFn([]);
    }
  }

  private async performSearch(term: string) {
    if (term.length < 2) return;

    this.isLoading = true;
    this.searchError = '';

    try {
      await this._AirportsService.getAirportsByCity(term, 'departure');
      this.saveRecentSearch(term);
    } catch (error) {
      console.error('Search failed:', error);
      this.searchError = 'Search failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  selectDeparture(airport: Airport) {
    this._SharedService.updateFlightObjFn('departureCity', airport);
    
    // Save to recent searches
    if (airport.city?.name) {
      this.saveRecentSearch(airport.city.name);
    }
    
    this.toggleDeparture();
  }

  selectPopularDestination(destination: ConvertedAirport) {
    // Convert to legacy format for compatibility
    const legacyAirport: Airport = {
      id: destination.id,
      name: destination.name,
      continent: destination.continent,
      city: destination.city,
      country: destination.country,
      airport_int_id: destination.airport_int_id,
      alternative_names: destination.alternative_names
    };
    
    this.selectDeparture(legacyAirport);
  }

  selectRecentSearch(search: string) {
    this.departure = search;
    this.searchDeparture();
  }

  clearRecentSearches() {
    if (isPlatformBrowser(this.platformId)) {
      this.recentSearches = [];
      localStorage.removeItem('recentDepartureSearches');
    }
  }

  toggleDeparture() {
    this._SharedService.updateUiStatesObjFn([{ toggleDeparture: false }]);
  }

  // Service mode toggle for debugging/testing
  toggleServiceMode() {
    const newMode = this.serviceMode === 'backend' ? false : true;
    this._AirportsService.toggleServiceMode(newMode);
    this.serviceMode = this._AirportsService.getCurrentServiceMode();
    
    // Clear current results and reload popular destinations
    this._SharedService.setSearchDepartureAirportsFn([]);
    this.loadPopularDestinations();
  }

  // Enhanced error handling
  retryLastSearch() {
    if (this.departure) {
      this.performSearch(this.departure);
    }
  }
}
