import {
  IBagsExtendedOptions,
  IBagsOptions,
  ISerializeResult,
} from 'src/app/modules/user/select-persons/select-persons.type';
import { Airport } from './airports.type';
import { Language } from 'src/app/core/types';

export interface DepartureArrivalTime {
  day: string;
  month: string;
  year: string;
  fullDate: Date;
  duration: string;
  hoursDepartureFrom: string;
  hoursDepartureTo: string;
}

export interface DepartureArrival {
  departure: {
    time: DepartureArrivalTime;
    route: Route[];
  };
  arrival?: {
    time: DepartureArrivalTime;
    route: Route[];
  };
}

export interface TimeParameters {
  unformmatedDate: string;
  duration: number;
  hoursFrom: string;
  hoursTo: string;
}

export interface RouteAndDataParameters {
  departureRoute: any;
  arrivalRoute: any;
}

export interface SelectedDates {
  departure: {
    day: string;
    month: string;
  };

  arrival: {
    day: string;
    month: string;
  };
}

export interface Route {
  id?: string;
  bags_recheck_required?: boolean;
  return: number;
  hoursFrom: string;
  hoursTo: string;
  isNextDay: boolean;
  waitingTime: string;
  flyFrom: string;
  flyTo: string;
  cityFrom: string;
  cityCodeFrom: string;
  cityTo: string;
  cityCodeTo: string;
  airline: string;
  flight_no: number;
}

export interface FlightSearchObj {
  departureCity: Airport;
  destinationCity: Airport;
  dateFrom: number;
  dateTo: number;
  isFlightTypeOneWay: boolean;
  infoSerialized: ISerializeResult;
  infoSerializedOptionsPersons: IBagsOptions;
  infoSerializedOptionsBags: IBagsExtendedOptions;
  daysToAdd: number;
  cabinClass: string;
  dateFromSubstract: number;
  dateToAdd: number;
  returnDateFromSubstract: number;
  returnDateToAdd: number;
  defaultLanguage: Language;
}

export interface FrvlFlightFormat {
  provider: string;
  id: string;
  booking_token: string;
  cityFrom: string;
  cityCodeFrom: string;
  cityTo: string;
  cityCodeTo: string;
  countryFrom: Country;
  countryTo: Country;
  local_departure: string;
  utc_departure: string;
  local_arrival: string;
  utc_arrival: string;
  nightsInDest: number;
  distance: number;
  duration: Duration;
  routes: DepartureArrival;
}

export interface Country {
  code: string;
  name: string;
}

export interface Duration {
  departure: number;
  return: number;
  total: number;
}
