import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import {
  BackendAirport,
  BackendCity,
  BackendCountry,
  LocationSearchResponse,
  NearbySearchRequest,
  NearbySearchResponse,
  LocationSearchFilters,
  ConvertedAirport,
  ConvertedAirports,
  AirportGroup,
  BackendApiConfig
} from '../../../shared/types/backend-airports.type';

import { SharedService } from '../../../shared/shared.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BackendAirportsService {
  private readonly apiConfig: BackendApiConfig = {
    baseUrl: environment.backendUrl || 'http://localhost:3000',
    endpoints: {
      universalSearch: '/api/locations/search',
      airportSearch: '/api/locations/airports/search',
      citySearch: '/api/locations/cities/search', 
      countrySearch: '/api/locations/countries/search',
      nearbySearch: '/api/locations/nearby',
      airportDetails: '/api/locations/airports',
      popularDestinations: '/api/locations/popular',
      statistics: '/api/locations/statistics'
    }
  };

  constructor(
    private http: HttpClient,
    private sharedService: SharedService
  ) {}

  /**
   * Universal search across airports, cities, and countries
   */
  async universalSearch(query: string, filters?: LocationSearchFilters): Promise<LocationSearchResponse> {
    try {
      let params = new HttpParams();
      
      if (query) params = params.set('query', query);
      if (filters?.countryCode) params = params.set('countryCode', filters.countryCode);
      if (filters?.continent) params = params.set('continent', filters.continent);
      if (filters?.isActive !== undefined) params = params.set('isActive', filters.isActive.toString());
      if (filters?.hasIataCode !== undefined) params = params.set('hasIataCode', filters.hasIataCode.toString());
      if (filters?.limit) params = params.set('limit', filters.limit.toString());
      if (filters?.offset) params = params.set('offset', filters.offset.toString());
      if (filters?.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters?.sortOrder) params = params.set('sortOrder', filters.sortOrder);

      const response = await firstValueFrom(
        this.http.get<LocationSearchResponse>(
          `${this.apiConfig.baseUrl}${this.apiConfig.endpoints.universalSearch}`,
          { params }
        )
      );

      return response;
    } catch (error) {
      console.error('Universal search failed:', error);
      throw error;
    }
  }

  /**
   * Search airports specifically
   */
  async searchAirports(query: string, filters?: LocationSearchFilters): Promise<BackendAirport[]> {
    try {
      let params = new HttpParams();
      
      if (query) params = params.set('query', query);
      if (filters?.countryCode) params = params.set('countryCode', filters.countryCode);
      if (filters?.isActive !== undefined) params = params.set('isActive', filters.isActive.toString());
      if (filters?.hasIataCode !== undefined) params = params.set('hasIataCode', filters.hasIataCode.toString());
      if (filters?.limit) params = params.set('limit', filters.limit.toString());

      const airports = await firstValueFrom(
        this.http.get<BackendAirport[]>(
          `${this.apiConfig.baseUrl}${this.apiConfig.endpoints.airportSearch}`,
          { params }
        )
      );

      return airports;
    } catch (error) {
      console.error('Airport search failed:', error);
      return [];
    }
  }

  /**
   * Search cities specifically  
   */
  async searchCities(query: string, filters?: LocationSearchFilters): Promise<BackendCity[]> {
    try {
      let params = new HttpParams();
      
      if (query) params = params.set('query', query);
      if (filters?.countryCode) params = params.set('countryCode', filters.countryCode);
      if (filters?.limit) params = params.set('limit', filters.limit.toString());

      const cities = await firstValueFrom(
        this.http.get<BackendCity[]>(
          `${this.apiConfig.baseUrl}${this.apiConfig.endpoints.citySearch}`,
          { params }
        )
      );

      return cities;
    } catch (error) {
      console.error('City search failed:', error);
      return [];
    }
  }

  /**
   * Find nearby airports and cities based on coordinates
   */
  async findNearby(searchData: NearbySearchRequest): Promise<NearbySearchResponse> {
    try {
      const response = await firstValueFrom(
        this.http.post<NearbySearchResponse>(
          `${this.apiConfig.baseUrl}${this.apiConfig.endpoints.nearbySearch}`,
          searchData
        )
      );

      return response;
    } catch (error) {
      console.error('Nearby search failed:', error);
      return { airports: [], cities: [] };
    }
  }

  /**
   * Get airport details by IATA/ICAO code or ID
   */
  async getAirportDetails(identifier: string): Promise<BackendAirport | null> {
    try {
      const airport = await firstValueFrom(
        this.http.get<BackendAirport>(
          `${this.apiConfig.baseUrl}${this.apiConfig.endpoints.airportDetails}/${identifier}`
        )
      );

      return airport;
    } catch (error) {
      console.error('Get airport details failed:', error);
      return null;
    }
  }

  /**
   * Convert backend airport data to component-compatible format
   */
  convertBackendAirportToLegacy(backendAirport: BackendAirport): ConvertedAirport {
    return {
      // Legacy format fields
      id: backendAirport.iataCode || backendAirport.icaoCode || backendAirport.id.toString(),
      name: backendAirport.name,
      continent: {
        id: backendAirport.continent.toLowerCase(),
        name: backendAirport.continent
      },
      city: {
        id: backendAirport.cityId?.toString() || backendAirport.id.toString(),
        name: backendAirport.cityName,
        continent: {
          id: backendAirport.continent.toLowerCase(),
          name: backendAirport.continent
        },
        country: {
          name: backendAirport.countryCode, // Will be resolved to full name
          code: backendAirport.countryCode
        }
      },
      country: {
        name: backendAirport.countryCode, // Will be resolved to full name
        code: backendAirport.countryCode
      },
      airport_int_id: backendAirport.id.toString(),
      alternative_names: backendAirport.keywords || [],
      
      // Enhanced fields from backend
      iataCode: backendAirport.iataCode,
      icaoCode: backendAirport.icaoCode,
      latitude: backendAirport.latitude,
      longitude: backendAirport.longitude,
      type: backendAirport.type,
      isActive: backendAirport.isActive,
      facilities: backendAirport.facilities,
      backendId: backendAirport.id
    };
  }

  /**
   * Convert backend city to legacy airport format (for cities without airports)
   */
  convertBackendCityToLegacy(backendCity: BackendCity): ConvertedAirport {
    return {
      id: backendCity.id.toString(),
      name: backendCity.name,
      continent: {
        id: backendCity.continent.toLowerCase(),
        name: backendCity.continent
      },
      city: {
        id: backendCity.id.toString(),
        name: backendCity.name,
        continent: {
          id: backendCity.continent.toLowerCase(),
          name: backendCity.continent
        },
        country: {
          name: backendCity.countryCode, // Will be resolved
          code: backendCity.countryCode
        }
      },
      country: {
        name: backendCity.countryCode, // Will be resolved
        code: backendCity.countryCode
      },
      airport_int_id: `city_${backendCity.id}`,
      alternative_names: backendCity.nameAlternative ? [backendCity.nameAlternative] : [],
      
      latitude: backendCity.latitude,
      longitude: backendCity.longitude,
      type: 'small_airport', // Default for cities
      isActive: backendCity.isActive,
      backendId: backendCity.id
    };
  }

  /**
   * Group converted airports by country (maintains legacy component compatibility)
   */
  groupAirportsByCountry(airports: ConvertedAirport[]): AirportGroup[] {
    const airportsByCountry: { [key: string]: ConvertedAirport[] } = 
      airports.reduce((acc, airport) => {
        const countryName = airport.country.name;
        if (!acc[countryName]) {
          acc[countryName] = [];
        }
        acc[countryName].push(airport);
        return acc;
      }, {} as { [key: string]: ConvertedAirport[] });

    // Sort by continent (Europe first)
    const sortedGroups: AirportGroup[] = Object.entries(airportsByCountry)
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
        locations: locations
      }));

    return sortedGroups;
  }

  /**
   * Main method to get airports by city (replaces legacy getAirportsByCity)
   */
  async getLocationsByQuery(query: string, searchType: 'departure' | 'destination'): Promise<AirportGroup[]> {
    try {
      if (!query || query.length < 2) {
        return [];
      }

      // Perform universal search to get both airports and cities
      const searchResponse = await this.universalSearch(query, {
        limit: 20,
        isActive: true,
        sortBy: 'relevance'
      });

      // Convert backend data to legacy format
      const convertedAirports: ConvertedAirport[] = [
        ...searchResponse.airports.map(airport => this.convertBackendAirportToLegacy(airport)),
        ...searchResponse.cities.map(city => this.convertBackendCityToLegacy(city))
      ];

      // Group by country
      const groupedAirports = this.groupAirportsByCountry(convertedAirports);

      // Update shared service (maintains legacy component compatibility)
      if (searchType === 'departure') {
        this.sharedService.setSearchDepartureAirportsFn(groupedAirports);
      } else {
        this.sharedService.setSearchDestinationAirportsFn(groupedAirports);
      }

      return groupedAirports;
    } catch (error) {
      console.error('Get locations by query failed:', error);
      return [];
    }
  }

  /**
   * Get nearby airports using geolocation (enhanced version of legacy getNearbyAirports)
   */
  async getNearbyLocations(): Promise<void> {
    try {
      // Get user's location (could be from IP or GPS)
      const location = await this.getUserLocation();
      
      if (!location) {
        console.warn('Could not get user location for nearby search');
        return;
      }

      // Search nearby airports and cities
      const nearbyData = await this.findNearby({
        latitude: location.latitude,
        longitude: location.longitude,
        radiusKm: 250,
        limit: 20
      });

      if (nearbyData.airports.length === 0 && nearbyData.cities.length === 0) {
        return;
      }

      // Convert to legacy format
      const convertedLocations = [
        ...nearbyData.airports.map(airport => this.convertBackendAirportToLegacy(airport)),
        ...nearbyData.cities.map(city => this.convertBackendCityToLegacy(city))
      ];

      // Get the best (closest/most relevant) location
      const bestLocation = this.getBestLocationFromResults(convertedLocations);
      
      if (bestLocation) {
        // Update shared service with the best departure location
        this.sharedService.updateFlightObjFn('departureCity', bestLocation);
      }

    } catch (error) {
      console.error('Get nearby locations failed:', error);
    }
  }

  /**
   * Get user's geolocation (IP-based fallback)
   */
  private async getUserLocation(): Promise<{latitude: number, longitude: number} | null> {
    try {
      // Try to get from browser geolocation first
      if (navigator.geolocation) {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            position => resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }),
            () => reject(null),
            { timeout: 5000 }
          );
        });
      }
      
      // Fallback to IP-based location (if available)
      const ipLocation = await firstValueFrom(
        this.http.get<{latitude: number, longitude: number}>('https://geoip-api.skypicker.com/')
          .pipe(catchError(() => of(null)))
      );
      
      return ipLocation;
    } catch {
      return null;
    }
  }

  /**
   * Get the best location from search results (lowest rank/most relevant)
   */
  private getBestLocationFromResults(locations: ConvertedAirport[]): ConvertedAirport | null {
    if (locations.length === 0) return null;

    // Prioritize airports with IATA codes, then by type importance
    const ranked = locations.sort((a, b) => {
      // IATA code airports first
      if (a.iataCode && !b.iataCode) return -1;
      if (!a.iataCode && b.iataCode) return 1;

      // Then by airport type importance
      const typeRanking = {
        'large_airport': 1,
        'medium_airport': 2, 
        'small_airport': 3,
        'heliport': 4,
        'seaplane_base': 5,
        'balloonport': 6
      };

      const aRank = typeRanking[a.type] || 10;
      const bRank = typeRanking[b.type] || 10;

      return aRank - bRank;
    });

    return ranked[0];
  }

  /**
   * Health check for backend service
   */
  async checkBackendHealth(): Promise<boolean> {
    try {
      const health = await firstValueFrom(
        this.http.get(`${this.apiConfig.baseUrl}${this.apiConfig.endpoints.statistics}`)
      );
      return true;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
}