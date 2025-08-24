// Flight Search Types
export interface FlightSearchDto {
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  returnDate?: string;
  passengers: PassengerDto;
  cabinClass: CabinClass;
  isRoundTrip: boolean;
}

export interface PassengerDto {
  adults: number;
  children: number;
  infants: number;
}

export enum CabinClass {
  ECONOMY = 'economy',
  BUSINESS = 'business',
  FIRST = 'first'
}

// Flight Result Types
export interface FlightResultDto {
  id: string;
  airline: string;
  flightNumber: string;
  departureAirport: AirportDto;
  arrivalAirport: AirportDto;
  departureDateTime: string;
  arrivalDateTime: string;
  duration: string;
  price: number;
  currency: string;
  availableSeats: number;
  stops: number;
  routes: RouteDto[];
}

export interface RouteDto {
  id: string;
  airline: string;
  flightNumber: string;
  departureAirport: AirportDto;
  arrivalAirport: AirportDto;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  aircraft?: string;
}

export interface AirportDto {
  iataCode: string;
  name: string;
  city: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Search Session
export interface FlightSearchSessionDto {
  id: string;
  searchCriteria: FlightSearchDto;
  results: FlightResultDto[];
  createdAt: string;
  expiresAt: string;
}