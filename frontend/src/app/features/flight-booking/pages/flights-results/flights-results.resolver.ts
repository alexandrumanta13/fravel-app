import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { catchError, map, of, switchMap, tap, timeout } from 'rxjs';
import { FlightsResultsService } from './flights-results.service';
import { FlightsResultsStorageService } from './flights-results-storage.service';
import { FlightSearchObj } from 'src/app/shared/types/flights-results.type';

// Modern functional resolver for Angular 17+
export const flightsResultsResolver = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const flightsService = inject(FlightsResultsService);
  const storageService = inject(FlightsResultsStorageService);
  const router = inject(Router);

  console.log('FlightsResultsResolver: Starting resolution');

  // Check for search parameters in route query params or state
  const searchParams = extractSearchParams(route, state);
  
  if (!searchParams || !isValidSearchParams(searchParams)) {
    console.warn('FlightsResultsResolver: Invalid or missing search parameters');
    
    // Try to get last valid search from storage as fallback
    return storageService.getLastValidResults().then(lastResults => {
      if (lastResults && lastResults.length > 0) {
        console.log('FlightsResultsResolver: Using cached results as fallback');
        flightsService['_allFlights'].set(lastResults);
        return { 
          success: true, 
          source: 'cache', 
          resultsCount: lastResults.length,
          message: 'Loaded previous search results'
        };
      } else {
        console.log('FlightsResultsResolver: Redirecting to home - no valid search data');
        router.navigate(['/']);
        return { 
          success: false, 
          redirect: true, 
          message: 'No search parameters found'
        };
      }
    }).catch(error => {
      console.error('FlightsResultsResolver: Error accessing storage:', error);
      router.navigate(['/']);
      return { 
        success: false, 
        redirect: true, 
        error: error.message
      };
    });
  }

  // Perform flight search
  console.log('FlightsResultsResolver: Performing flight search');
  
  return flightsService.searchFlights(searchParams)
    .then(() => {
      console.log('FlightsResultsResolver: Flight search completed successfully');
      
      // Add search to history
      storageService.addToSearchHistory(searchParams, flightsService.allFlights().length)
        .catch(error => console.warn('Failed to save search history:', error));

      return { 
        success: true, 
        source: 'search', 
        resultsCount: flightsService.allFlights().length,
        searchParams
      };
    })
    .catch(error => {
      console.error('FlightsResultsResolver: Flight search failed:', error);
      
      // Try to get cached results as fallback
      return storageService.getCachedFlightResults(searchParams)
        .then(cachedResults => {
          if (cachedResults && cachedResults.data.length > 0) {
            console.log('FlightsResultsResolver: Using cached results after search failure');
            flightsService['processFlightResults'](cachedResults.data);
            
            return { 
              success: true, 
              source: 'cache_fallback', 
              resultsCount: cachedResults.data.length,
              warning: 'Search failed, using cached results',
              error: error.message
            };
          } else {
            // Complete failure - no search results and no cache
            return { 
              success: false, 
              source: 'none', 
              resultsCount: 0,
              error: error.message,
              message: 'Flight search failed and no cached results available'
            };
          }
        })
        .catch(cacheError => {
          console.error('FlightsResultsResolver: Cache fallback also failed:', cacheError);
          return { 
            success: false, 
            source: 'none', 
            resultsCount: 0,
            error: `Search failed: ${error.message}, Cache failed: ${cacheError.message}`
          };
        });
    });
};

// Helper functions
function extractSearchParams(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): FlightSearchObj | null {
  // Try to extract search parameters from various sources
  
  // 1. From route query parameters
  const queryParams = route.queryParams;
  if (hasRequiredQueryParams(queryParams)) {
    return buildSearchObjFromQueryParams(queryParams);
  }

  // 2. From route state (navigation extras)
  const navigationState = history.state;
  if (navigationState && navigationState.searchObj) {
    return navigationState.searchObj as FlightSearchObj;
  }

  // 3. From session storage (as fallback)
  try {
    const sessionSearch = sessionStorage.getItem('currentFlightSearch');
    if (sessionSearch) {
      return JSON.parse(sessionSearch) as FlightSearchObj;
    }
  } catch (error) {
    console.warn('Error parsing session storage search:', error);
  }

  return null;
}

function hasRequiredQueryParams(params: any): boolean {
  return !!(
    params.from && 
    params.to && 
    params.departureDate &&
    params.adults
  );
}

function buildSearchObjFromQueryParams(params: any): FlightSearchObj {
  // This is a simplified version - in a real app, you'd need to properly
  // reconstruct airport objects, parse dates, etc.
  return {
    departureCity: {
      id: params.from,
      name: params.fromName || params.from,
      city: { name: params.fromCity || params.from }
    } as any,
    destinationCity: {
      id: params.to,
      name: params.toName || params.to,
      city: { name: params.toCity || params.to }
    } as any,
    dateFrom: new Date(params.departureDate).getTime(),
    dateTo: params.returnDate ? new Date(params.returnDate).getTime() : new Date(params.departureDate).getTime(),
    isFlightTypeOneWay: !params.returnDate,
    infoSerialized: {
      adults: parseInt(params.adults) || 1,
      children: parseInt(params.children) || 0,
      infants: parseInt(params.infants) || 0
    },
    infoSerializedOptionsPersons: {} as any,
    infoSerializedOptionsBags: {} as any,
    daysToAdd: parseInt(params.daysToAdd) || 3,
    cabinClass: params.cabinClass || 'M',
    dateFromSubstract: parseInt(params.dateFromSubstract) || 3,
    dateToAdd: parseInt(params.dateToAdd) || 3,
    returnDateFromSubstract: parseInt(params.returnDateFromSubstract) || 3,
    returnDateToAdd: parseInt(params.returnDateToAdd) || 3,
    defaultLanguage: {
      key: params.locale || 'en',
      defaultCurrency: params.currency || 'EUR'
    } as any
  };
}

function isValidSearchParams(searchObj: FlightSearchObj): boolean {
  return !!(
    searchObj.departureCity &&
    searchObj.destinationCity &&
    searchObj.dateFrom &&
    searchObj.infoSerialized &&
    searchObj.infoSerialized.adults > 0
  );
}

// Legacy class-based resolver for backward compatibility
export class FlightsResultsResolver {
  constructor(
    private flightsService: FlightsResultsService,
    private storageService: FlightsResultsStorageService,
    private router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // Delegate to functional resolver
    return flightsResultsResolver(route, state);
  }
}
