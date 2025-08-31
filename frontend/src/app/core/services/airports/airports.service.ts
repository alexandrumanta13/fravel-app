import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  Airport,
  Airports,
  AirportsByCountry,
  GeoLocation,
} from 'src/app/shared/types';
import { SharedService } from 'src/app/shared/shared.service';
import { environment } from 'src/environments/environment.prod';
import { BackendAirportsService } from './backend-airports.service';

@Injectable({
  providedIn: 'root',
})
export class AirportsService {
  headers = new HttpHeaders({
    accept: 'application/json',
    apikey: environment.KIWI_KEY,
  });

  // Feature flag to toggle between legacy (Kiwi) and new backend
  private useBackendService = environment.useBackendAirports || false;

  constructor(
    private http: HttpClient,
    private _SharedService: SharedService,
    private backendAirportsService: BackendAirportsService
  ) {}

  async getNearbyAirports() {
    try {
      // Use new backend service if enabled
      if (this.useBackendService) {
        await this.backendAirportsService.getNearbyLocations();
        return;
      }

      // Legacy Kiwi implementation
      const location = await firstValueFrom(
        this.http.get<GeoLocation>('https://geoip-api.skypicker.com/')
      );

      const params = new HttpParams()
        .set('lat', location.latitude)
        .set('lon', location.longitude)
        .set('radius', '250')
        .set(
          'locale',
          this._SharedService.flightSearch().defaultLanguage.locale
        )
        .set('location_types', 'airport')
        .set('limit', '20')
        .set('active_only', 'true');

      const airports = await firstValueFrom(
        this.http.get<Airports>(
          'https://tequila-api.kiwi.com/locations/radius',
          {
            headers: this.headers,
            params: params,
          }
        )
      );

      if (airports.locations.length === 0) {
        return;
      }

      this._SharedService.updateFlightObjFn(
        'departureCity',
        this.getAirportWithLowestRank(airports)
      );

    } catch (err) {
      console.log(err);
      // If backend fails, try to fall back to legacy service
      if (this.useBackendService) {
        console.warn('Backend service failed, falling back to legacy Kiwi API');
        this.useBackendService = false;
        await this.getNearbyAirports();
      }
    }
  }

  async getAirportsByCity(city_id: string, action: string) {
    try {
      // Use new backend service if enabled
      if (this.useBackendService) {
        const searchType = action as 'departure' | 'destination';
        await this.backendAirportsService.getLocationsByQuery(city_id, searchType);
        return;
      }

      // Legacy Kiwi implementation
      const params = new HttpParams()
        .set('term', city_id)
        .set(
          'locale',
          this._SharedService.flightSearch().defaultLanguage.locale
        )
        .set('location_types', 'airport')
        .set('limit', '20')
        .set('active_only', 'true');

      const airports = await firstValueFrom(
        this.http.get<Airports>(
          'https://tequila-api.kiwi.com/locations/query',
          {
            headers: this.headers,
            params: params,
          }
        )
      );

      if (airports.locations.length === 0) {
        return;
      }

      const groupeAirports = this.groupAirportsByCountry(airports);

      action === 'departure'
        ? this._SharedService.setSearchDepartureAirportsFn(groupeAirports)
        : this._SharedService.setSearchDestinationAirportsFn(groupeAirports);
    } catch (err) {
      console.log(err);
      // If backend fails, try to fall back to legacy service
      if (this.useBackendService) {
        console.warn('Backend search failed, falling back to legacy Kiwi API');
        this.useBackendService = false;
        await this.getAirportsByCity(city_id, action);
      }
    }
  }

  setAirportsCountryAndContinent(airports: Airports) {
    // sometimes api call returns country property outside city
    airports.locations.forEach((airport) => {
      if (airport.country && !airport.city.country) {
        airport.city.country = airport.country;
      }
      if (airport.continent && !airport.city.continent) {
        airport.city.continent = airport.continent;
      }
    });

    return this.groupAirportsByCountry(airports);
  }

  groupAirportsByCountry(airports: Airports) {
    // Group airports by country
    const airportsByCountry: { [key: string]: Airport[] } =
      airports.locations.reduce((acc: AirportsByCountry, airport: Airport) => {
        if (!acc[airport.city.country.name]) {
          acc[airport.city.country.name] = [];
        }
        acc[airport.city.country.name].push(airport);
        return acc;
      }, {});

    // Sort airports by continent, Europe to go first
    const sortedAirports: Airports[] = Object.entries(airportsByCountry)
      .sort(([, airportsA], [, airportsB]) => {
        const continentA = airportsA[0].city.continent.id;
        const continentB = airportsB[0].city.continent.id;

        if (continentA === 'europe' && continentB !== 'europe') {
          return -1;
        } else if (continentA !== 'europe' && continentB === 'europe') {
          return 1;
        } else {
          return 0;
        }
      })
      .map(([country, locations]) => ({
        id: country,
        locations: locations,
      }));

    return sortedAirports;
  }

  getAirportWithLowestRank(airports: Airports) {
    // The main airport is the one with the lowest rank
    const airportWithLowestGlobalRank = airports.locations.reduce(
      (min: any, obj: any) =>
        obj.global_rank_dst < min.global_rank_dst ? obj : min,
      airports.locations[0]
    );

    return airportWithLowestGlobalRank;
  }

  /**
   * Toggle between backend and legacy (Kiwi) service
   */
  toggleServiceMode(useBackend: boolean) {
    this.useBackendService = useBackend;
    console.log(`Airports service switched to: ${useBackend ? 'Backend' : 'Legacy (Kiwi)'} mode`);
  }

  /**
   * Check if backend service is available
   */
  async checkBackendAvailability(): Promise<boolean> {
    try {
      return await this.backendAirportsService.checkBackendHealth();
    } catch {
      return false;
    }
  }

  /**
   * Get current service mode
   */
  getCurrentServiceMode(): 'backend' | 'legacy' {
    return this.useBackendService ? 'backend' : 'legacy';
  }

  /**
   * Auto-detect and configure best available service
   */
  async autoConfigureService(): Promise<void> {
    const backendAvailable = await this.checkBackendAvailability();
    
    if (backendAvailable && !this.useBackendService) {
      console.log('Backend service available, switching to backend mode');
      this.toggleServiceMode(true);
    } else if (!backendAvailable && this.useBackendService) {
      console.log('Backend service unavailable, switching to legacy mode');
      this.toggleServiceMode(false);
    }
  }
}
