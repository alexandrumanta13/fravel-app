// Backend API Types for Airports & Cities

export interface BackendAirport {
  id: number;
  name: string;
  iataCode?: string;
  icaoCode?: string;
  cityId?: number;
  cityName: string;
  countryId: number;
  countryCode: string;
  continent: string;
  region?: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone?: number;
  type: AirportType;
  isActive: boolean;
  website?: string;
  wikipediaLink?: string;
  keywords?: string[];
  runwayCount?: number;
  facilities?: AirportFacilities;
  contact?: AirportContact;
  createdAt: string;
  updatedAt: string;
}

export interface BackendCity {
  id: number;
  name: string;
  nameAscii?: string;
  nameAlternative?: string;
  countryId: number;
  countryCode: string;
  continent: string;
  region?: string;
  subregion?: string;
  latitude: number;
  longitude: number;
  population?: number;
  timezone?: string;
  isCapital: boolean;
  elevation?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackendCountry {
  id: number;
  name: string;
  code: string; // ISO 3166-1 alpha-2
  code3: string; // ISO 3166-1 alpha-3
  continent: string;
  region: string;
  capital?: string;
  population?: number;
  area?: number;
  timezone?: string;
  currency?: string;
  languages?: string[];
  flag?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AirportType = 
  | 'large_airport' 
  | 'medium_airport' 
  | 'small_airport' 
  | 'heliport' 
  | 'seaplane_base' 
  | 'balloonport'
  | 'closed';

export interface AirportFacilities {
  hasCustoms?: boolean;
  hasImmigration?: boolean;
  hasQuarantine?: boolean;
  hasFuelAvailable?: boolean;
  hasCarRental?: boolean;
  hasHotel?: boolean;
  hasRestaurant?: boolean;
  hasWifi?: boolean;
  hasParkingShortTerm?: boolean;
  hasParkingLongTerm?: boolean;
  hasPublicTransport?: boolean;
  terminalCount?: number;
  annualPassengers?: number;
}

export interface AirportContact {
  phone?: string;
  fax?: string;
  email?: string;
  address?: string;
  postalCode?: string;
}

// API Response Types
export interface LocationSearchResponse {
  airports: BackendAirport[];
  cities: BackendCity[];
  countries: BackendCountry[];
  totalResults: number;
  searchTime: number;
}

export interface NearbySearchRequest {
  latitude: number;
  longitude: number;
  radiusKm: number;
  airportTypesOnly?: AirportType[];
  limit?: number;
}

export interface NearbySearchResponse {
  airports: BackendAirport[];
  cities: BackendCity[];
}

// Search filters
export interface LocationSearchFilters {
  query?: string;
  countryCode?: string;
  continent?: string;
  airportType?: AirportType[];
  isActive?: boolean;
  hasIataCode?: boolean;
  isInternational?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'name' | 'distance' | 'size';
  sortOrder?: 'ASC' | 'DESC';
}

// Converted types for component compatibility (bridge old and new)
export interface ConvertedAirport {
  // Original format fields (for backward compatibility)
  id: string;
  name: string;
  continent: any;
  city: {
    id: string;
    name: string;
    continent: any;
    country: {
      name: string;
      code: string;
    };
  };
  country: {
    name: string;
    code: string;
  };
  airport_int_id: string;
  alternative_names: string[];
  
  // Enhanced fields from backend
  iataCode?: string;
  icaoCode?: string;
  latitude: number;
  longitude: number;
  type: AirportType;
  isActive: boolean;
  facilities?: AirportFacilities;
  backendId: number; // Reference to backend ID
}

export interface ConvertedAirports {
  id: string;
  locations: ConvertedAirport[];
}

// Utility types for grouping
export interface AirportsByCountry {
  [key: string]: ConvertedAirport[];
}

export interface AirportGroup {
  id: string;
  locations: ConvertedAirport[];
}

// API Configuration
export interface BackendApiConfig {
  baseUrl: string;
  endpoints: {
    universalSearch: string;
    airportSearch: string;
    citySearch: string;
    countrySearch: string;
    nearbySearch: string;
    airportDetails: string;
    popularDestinations: string;
    statistics: string;
  };
}