import { Component, Inject, PLATFORM_ID, effect, OnInit, OnDestroy } from '@angular/core';
import { Airport, Airports, ConvertedAirport, AirportGroup } from 'src/app/shared/types';
import { SharedService } from 'src/app/shared/shared.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { isPlatformBrowser } from '@angular/common';
import { AirportsService } from 'src/app/core/services/airports/airports.service';
import { BackendAirportsService } from 'src/app/core/services/airports/backend-airports.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
@Component({
  standalone: true,
  selector: 'app-select-destination',
  templateUrl: './select-destination.component.html',
  styleUrls: ['./select-destination.component.scss'],
  imports: [SharedModule],
})
export class SelectDestinationComponent implements OnInit, OnDestroy {
  screenHeight: number = 0;
  screenWidth: number = 0;
  toggleMenu: boolean = false;
  destination: string = '';
  airports: Airports[] = [];
  destinationCity: Airport = {} as Airport;
  
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
        this.airports = this._SharedService.destinationAirports();
        this.destinationCity = this._SharedService.flightSearch().destinationCity;
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
      debounceTime(300),
      distinctUntilChanged(),
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
      const stored = localStorage.getItem('recentDestinationSearches');
      if (stored) {
        this.recentSearches = JSON.parse(stored).slice(0, 5);
      }
    }
  }

  private saveRecentSearch(term: string) {
    if (isPlatformBrowser(this.platformId) && term.length > 0) {
      const recent = [term, ...this.recentSearches.filter(s => s !== term)].slice(0, 5);
      this.recentSearches = recent;
      localStorage.setItem('recentDestinationSearches', JSON.stringify(recent));
    }
  }

  searchDestination() {
    const term = this.destination.trim();
    if (term.length > 0) {
      this.searchTerms.next(term);
    } else {
      // Clear results when search is empty
      this._SharedService.setSearchDestinationAirportsFn([]);
    }
  }

  private async performSearch(term: string) {
    if (term.length < 2) return;

    this.isLoading = true;
    this.searchError = '';

    try {
      await this._AirportsService.getAirportsByCity(term, 'destination');
      this.saveRecentSearch(term);
    } catch (error) {
      console.error('Search failed:', error);
      this.searchError = 'Search failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  selectDestination(airport: Airport) {
    this._SharedService.updateFlightObjFn('destinationCity', airport);
    
    // Save to recent searches
    if (airport.city?.name) {
      this.saveRecentSearch(airport.city.name);
    }
    
    const dynamicQueryParams = {
      destination: airport.city.name,
    };

    this._SharedService.setQueryParamsFn(dynamicQueryParams);

    this.toggleDestination();
    if (Object.keys(this.destinationCity).length) {
      this._SharedService.setStepFn(2);
    }
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
    
    this.selectDestination(legacyAirport);
  }

  selectRecentSearch(search: string) {
    this.destination = search;
    this.searchDestination();
  }

  clearRecentSearches() {
    if (isPlatformBrowser(this.platformId)) {
      this.recentSearches = [];
      localStorage.removeItem('recentDestinationSearches');
    }
  }

  toggleDestination() {
    this._SharedService.updateUiStatesObjFn([{ toggleDestination: false }]);
  }

  // Service mode toggle for debugging/testing
  toggleServiceMode() {
    const newMode = this.serviceMode === 'backend' ? false : true;
    this._AirportsService.toggleServiceMode(newMode);
    this.serviceMode = this._AirportsService.getCurrentServiceMode();
    
    // Clear current results and reload popular destinations
    this._SharedService.setSearchDestinationAirportsFn([]);
    this.loadPopularDestinations();
  }

  // Enhanced error handling
  retryLastSearch() {
    if (this.destination) {
      this.performSearch(this.destination);
    }
  }
}
