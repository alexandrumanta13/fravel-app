import { Injectable, signal } from '@angular/core';
import { I18nService } from '../../components/i18n/i18n.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { SharedService } from '../../shared.service';
import { ConverDateUtils } from 'src/app/core/utilities/convert-date-utils.service';
import {
  CheckFlight,
  DepartureArrival,
  DepartureArrivalTime,
  FrvlFlightFormat,
  KiwiFlightsResult,
  KiwiResponse,
  KiwiRoute,
  Route,
  RouteAndDataParameters,
  TimeParameters,
} from '../../types';

@Injectable({
  providedIn: 'root',
})
export class KiwiService {
  headers = new HttpHeaders({
    accept: 'application/json',
    apikey: environment.KIWI_KEY,
  });

  kiwiFlights = signal<KiwiFlightsResult[]>([]);

  constructor(
    private _I18nService: I18nService,
    private _SharedService: SharedService,
    private _ConverDateUtils: ConverDateUtils,
    private http: HttpClient
  ) {}

  async searchFlights() {
    try {
      const {
        departureCity,
        destinationCity,
        dateFromSubstract,
        dateToAdd,
        returnDateFromSubstract,
        returnDateToAdd,
        infoSerializedOptionsPersons,
        cabinClass,
        infoSerialized,
        defaultLanguage,
        isFlightTypeOneWay,
      } = this._SharedService.flightSearch();

      const params = new HttpParams()

        .set('fly_from', departureCity.id)
        .set('fly_from_city_name', departureCity.city.name)
        .set('fly_from_airport_name', departureCity.name)
        .set('fly_to', destinationCity.id)
        .set('fly_to_city_name', destinationCity.city.name)
        .set('fly_to_airport_name', destinationCity.name)
        .set(
          'date_from',
          this._ConverDateUtils.formatDatesForKiwiSearch(dateFromSubstract)
        )
        .set(
          'date_to',
          this._ConverDateUtils.formatDatesForKiwiSearch(dateToAdd)
        )
        .set(
          'return_from',
          this._ConverDateUtils.formatDatesForKiwiSearch(
            returnDateFromSubstract
          )
        )
        .set(
          'return_to',
          this._ConverDateUtils.formatDatesForKiwiSearch(returnDateToAdd)
        )
        .set('adults', infoSerializedOptionsPersons.selectedAdults)
        .set('children', infoSerializedOptionsPersons.selectedChildren)
        .set('infants', infoSerializedOptionsPersons.selectedInfants)
        .set('selected_cabins', cabinClass)
        .set('adult_hold_bag', infoSerialized.serialized.adult.holdBags)
        .set('adult_hand_bag', infoSerialized.serialized.adult.handBags)
        .set(
          'child_hold_bag',
          infoSerialized.serialized.children.holdBags ?? ''
        )
        .set(
          'child_hand_bag',
          infoSerialized.serialized.children.handBags ?? ''
        )
        .set('curr', defaultLanguage.defaultCurrency)
        .set('locale', defaultLanguage.key)
        .set('flight_type', isFlightTypeOneWay ? 'oneway' : 'round')
        .set('vehicle_type', 'aircraft')
        .set('limit', 1000);

      const flights = await firstValueFrom(
        this.http.get<KiwiResponse>('https://api.tequila.kiwi.com/v2/search', {
          headers: this.headers,
          params: params,
        })
      );

      console.log(flights);

      if (flights.data.length === 0) {
        return;
      }

      const availableFlights = this.filterAvailableFlights(flights.data);

      this.checkFlightPrice(availableFlights[0].booking_token);

      this.kiwiFlights.set(availableFlights);

      const frvlFormmatedFlights =
        this.createFlightFrvlFormat(availableFlights);

      console.log(frvlFormmatedFlights);
    } catch (err) {
      console.log(err);
      //TODO: implement error message service
    }
  }

  /**
   *
   * @param availableFlights
   * @returns
   * Filter flights based on total number of passangers < available seats
   */

  filterAvailableFlights(availableFlights: KiwiFlightsResult[]) {
    const { selectedAdults, selectedChildren } =
      this._SharedService.flightSearch().infoSerializedOptionsPersons;
    const filteredAndSortedFlights = availableFlights
      .filter(
        (flight: KiwiFlightsResult) =>
          flight.availability.seats !== null &&
          flight.availability.seats >= selectedAdults + selectedChildren
      )
      .sort((a, b) => a.price - b.price)
      .map((flight: KiwiFlightsResult) => ({
        ...flight,
        price: Math.round(flight.price),
      }));

    return filteredAndSortedFlights;
  }

  /**
   *
   * @param booking_token
   * Kiwi needs an extra stept to provide the real prices
   */

  async checkFlightPrice(booking_token: string) {
    try {
      const flightSearchObj = this._SharedService.flightSearch();
      const params = new HttpParams()
        .set('booking_token', booking_token)
        .set(
          'bnum',
          flightSearchObj.infoSerializedOptionsPersons.bags.holdBagsSelected
        )
        .set(
          'adults',
          flightSearchObj.infoSerializedOptionsPersons.selectedAdults
        )
        .set(
          'children',
          flightSearchObj.infoSerializedOptionsPersons.selectedChildren
        )
        .set(
          'infants',
          flightSearchObj.infoSerializedOptionsPersons.selectedInfants
        )
        .set('currency', flightSearchObj.defaultLanguage.defaultCurrency);

      const flight = await firstValueFrom(
        this.http.get<CheckFlight>(
          'https://api.tequila.kiwi.com/v2/booking/check_flights',
          {
            headers: this.headers,
            params: params,
          }
        )
      );

      console.log(flight);
    } catch (err) {
      console.log(err);
      //TODO: implement error message service
    }
  }

  createFlightFrvlFormat(flights: KiwiFlightsResult[]) {
    const frvlFlightFormat: FrvlFlightFormat[] = [];
    flights.forEach((flight) => {
      frvlFlightFormat.push({
        provider: 'tqa', // 'tqa' stands for tequila-api
        id: flight.id,
        booking_token: flight.booking_token,
        cityFrom: flight.cityFrom,
        cityCodeFrom: flight.cityCodeFrom,
        cityTo: flight.cityTo,
        cityCodeTo: flight.cityCodeTo,
        countryFrom: flight.countryFrom,
        countryTo: flight.countryTo,
        local_departure: flight.local_departure,
        utc_departure: flight.utc_departure,
        local_arrival: flight.local_arrival,
        utc_arrival: flight.utc_arrival,
        nightsInDest: flight.nightsInDest,
        distance: flight.distance,
        duration: flight.duration,
        routes: this.createDepartureArrivalRoutes(flight),
      });
    });

    return frvlFlightFormat;
  }

  /**
   *
   * @param flight
   * @returns
   * Kiwi provides dates in ISO format as UTC and Local time
   * KiwiRoute[] interface for route property in response object must be parsed and formatted
   * in a FrvlFlightFormat
   */

  createDepartureArrivalRoutes(flight: KiwiFlightsResult) {
    const departureRoute = flight.route.filter(
      (route: any) => route.return === 0
    );
    const arrivalRoute = flight.route.filter(
      (route: any) => route.return === 1
    );

    const departureObj = {
      unformmatedDate: flight.utc_departure,
      hoursFrom: this._ConverDateUtils.kiwiConvertISOTimeStringToHours(
        flight.utc_departure
      ),
      duration: flight.duration.departure,
      hoursTo: this._ConverDateUtils.kiwiConvertISOTimeStringToHoursUTC(
        flight.local_arrival
      ),
    };

    const arrivalObj = {
      unformmatedDate: arrivalRoute[arrivalRoute.length - 1].local_departure,
      hoursFrom: this._ConverDateUtils.kiwiConvertISOTimeStringToHoursUTC(
        arrivalRoute[arrivalRoute.length - 1].local_departure
      ),
      duration: flight.duration.return,
      hoursTo: this._ConverDateUtils.kiwiConvertISOTimeStringToHours(
        arrivalRoute[arrivalRoute.length - 1].utc_arrival
      ),
    };

    const flightObj = {
      departureRoute: departureRoute,
      arrivalRoute: arrivalRoute,
    };

    return this.convertISOTimeStringFrvl(departureObj, arrivalObj, flightObj);
  }

  /**
   *
   * @param departureTimeParams
   * @param arrivalTimeParams
   * @param routeAndDataParams
   * @returns
   */

  convertISOTimeStringFrvl(
    departureTimeParams: TimeParameters,
    arrivalTimeParams: TimeParameters,
    routeAndDataParams: RouteAndDataParameters
  ): DepartureArrival {
    const departureTime =
      this._ConverDateUtils.kiwiFormatToDayMonth(departureTimeParams);

    const arrivalTime =
      this._ConverDateUtils.kiwiFormatToDayMonth(arrivalTimeParams);

    return this.createDepartureArrival(
      departureTime,
      arrivalTime,
      routeAndDataParams
    );
  }

  /**
   *
   * @param departureTime
   * @param arrivalTime
   * @param routeAndDataParams
   * @returns
   *
   * Each route has property return contaning value 0 or 1,
   * 0 means is departure, 1 means is return
   */

  createDepartureArrival(
    departureTime: DepartureArrivalTime,
    arrivalTime: DepartureArrivalTime,
    { departureRoute, arrivalRoute }: RouteAndDataParameters
  ): DepartureArrival {
    const isOneWay = this._SharedService.flightSearch().isFlightTypeOneWay;

    const departure = {
      time: departureTime,
      route: this.processRoutes(departureRoute),
    };

    let arrival = {
      time: {} as DepartureArrivalTime,
      route: [] as Route[],
    };

    let departureArrival = { ...{ departure: departure, arrival: arrival } };

    if (!isOneWay) {
      arrival = {
        time: arrivalTime,
        route: this.processRoutes(arrivalRoute),
      };
      departureArrival = { ...departureArrival, arrival: arrival };
    }

    return departureArrival;
  }

  /**
   *
   * @param routes
   * @returns
   *
   * Transform ISO UTC and Local time and add additional converted info
   */

  processRoutes(routes: KiwiRoute[]) {
    const isNextDayFn = (routes: KiwiRoute[], currentIndex: number) => {
      if (currentIndex <= 0 || currentIndex >= routes.length) {
        return false;
      }

      const dTimeCurrent = new Date(routes[currentIndex].utc_departure);
      const dTimePrevious = new Date(routes[currentIndex - 1].utc_departure);

      return dTimeCurrent.getDate() !== dTimePrevious.getDate();
    };

    let fravelRoutes: Route[] = [];

    routes.forEach((route: KiwiRoute, index: number) => {
      const hoursFrom =
        this._ConverDateUtils.kiwiConvertISOTimeStringToHoursUTC(
          route.local_departure
        );
      const hoursTo = this._ConverDateUtils.kiwiConvertISOTimeStringToHoursUTC(
        route.local_arrival
      );

      const isNextDay = isNextDayFn(routes, index);
      let waitingTime = '';
      if (index < routes.length - 1) {
        const nextRoute = routes[index + 1];
        waitingTime = this._ConverDateUtils.kiwiGetWaitingTime(
          route.utc_arrival,
          nextRoute.utc_departure
        );
      }

      fravelRoutes.push({
        flyFrom: route.flyFrom,
        flyTo: route.flyTo,
        cityFrom: route.cityFrom,
        cityCodeFrom: route.cityCodeFrom,
        cityTo: route.cityTo,
        cityCodeTo: route.cityCodeTo,
        return: route.return,
        airline: route.airline,
        flight_no: route.flight_no,
        bags_recheck_required: route.bags_recheck_required,
        isNextDay: isNextDay,
        waitingTime: waitingTime,
        hoursFrom: hoursFrom,
        hoursTo: hoursTo,
      });
    });

    return fravelRoutes;
  }
}
