import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, effect, signal } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  forkJoin,
  Observable,
  of,
  throwError,
} from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';

import { environment } from 'src/environments/environment.prod';
// import { SearchFlightsService } from '../search-flights/search-flights.service';
// import { FlightObj } from '../search-flights/search-flights.type';
// import { SelectDateService } from '../select-date/select-date.service';
import { ObjectUtilsService } from 'src/app/core/utilities/object-utils.service';
import { Router } from '@angular/router';
import { ConverDateUtils } from 'src/app/core/utilities/convert-date-utils.service';
import {
  DepartureArrival,
  DepartureArrivalTime,
  RouteAndDataParameters,
  SelectedDates,
  TimeParameters,
} from '../../../shared/types';
import { I18nService } from 'src/app/shared/components/i18n/i18n.service';
import { LoaderService } from 'src/app/core/services';
// Legacy: import { KiwiService } from 'src/app/_reference/kiwi-legacy/kiwi.service';

@Injectable({
  providedIn: 'root',
})
export class FlightsResultsService {
  flights$ = new BehaviorSubject<any>('');
  allFlights$ = new BehaviorSubject<any>([]);
  beforeFlights: any[] = [];
  afterFlights: any[] = [];
  beforeFlights$ = new BehaviorSubject<any[]>([]);
  afterFlights$ = new BehaviorSubject<any[]>([]);
  filtersState$ = new BehaviorSubject<string>('closed');
  beforeIndex$ = new BehaviorSubject<number>(0);
  departureDate: any;
  departureDate$ = new BehaviorSubject<any>('');
  departureBeforeAndAfterFlightsDates$ = new BehaviorSubject<any[]>([]);
  selectedDates$ = new BehaviorSubject<SelectedDates>({} as SelectedDates);
  flightsFromSelectedDate$ = new BehaviorSubject<any[]>([]);
  returnBeforeAfterFlightsDates$ = new BehaviorSubject<any[]>([]);
  selectedFlight$ = new BehaviorSubject<any>({});

  date: any;
  private sessionId$ = new BehaviorSubject<string>('');
  private inactivityTimer!: any;

  flightsResult = signal([]);
  kiwiFlights: any;
  constructor(
    private _httpClient: HttpClient,
    // private _SelectDateService: SelectDateService,
    // private _I18nService: I18nService,
    // private _SearchFlightsService: SearchFlightsService,
    private _ObjectUtilsService: ObjectUtilsService,
    private _ConverDateUtils: ConverDateUtils,
    private _LoaderSerice: LoaderService,
    private _router: Router,
    // Legacy: private _KiwiService: KiwiService
  ) {
    this.createSession();
    // Legacy Kiwi effect - disabled
    // effect(() => {
    //   this.kiwiFlights = this._KiwiService.kiwiFlights();
    // });
  }

  aggregateFlights() {
    // console.log(this.kiwiFlights[0]);
  }

  returnFlights(obj: any): Observable<any> {
    const headers = new HttpHeaders({
      accept: 'application/json',
      apikey: environment.KIWI_KEY,
    });

    const params = new HttpParams({
      fromObject: obj,
    });

    this._LoaderSerice.setLoaderProgress(100, 5000);
    return this._httpClient
      .get<any>('https://api.tequila.kiwi.com/v2/search', {
        headers: headers,
        params: params,
      })
      .pipe(
        catchError((error: any) => {
          // Handle HTTP errors here (e.g., network issues, API errors)
          console.error('HTTP Error:', error);
          this._LoaderSerice.loadingProgress$.next(0);
          return throwError('Something went wrong, please try again later.');
        }),
        tap((flights: any) => {
          let availableFlights = flights.data;
          const filteredAndSortedFlights = availableFlights
            .filter(
              (flight: any) =>
                flight.availability.seats !== null &&
                flight.availability.seats >= obj.adults + obj.children
            )
            .sort((a: any, b: any) => a.price - b.price)
            .map((flight: any) => ({
              ...flight,
              price: Math.round(flight.price),
            }));

          availableFlights = filteredAndSortedFlights;
          console.log(availableFlights);
          this.flights$.next(availableFlights);
          this._LoaderSerice.stopLoaderProgress();
          return availableFlights;
        })
      );
  }

  // arrangeData(): Observable<any> {
  //   return combineLatest([
  //     this._SelectDateService.dateSelected$,
  //     this._SelectDateService.oneWay$,
  //     this._SearchFlightsService.flightObj$,
  //     this.flights$,
  //     this._I18nService.defaultLanguage$,
  //   ]).pipe(
  //     take(1),
  //     map(
  //       ([dateSelected$, oneWay$, flightObj$, flights$, defaultLanguage$]) => {
  //         const data = {
  //           dateSelected: dateSelected$,
  //           oneWay: oneWay$,
  //           flightObj: flightObj$,
  //           flights: flights$,
  //           defaultLanguage: defaultLanguage$,
  //         };

  //         return data;
  //       }
  //     ),
  //     tap((data) => {
  //       if (!data) {
  //         console.log('Data is undefined:', data);
  //         alert('No data');
  //         return; // Return an empty observable or handle accordingly
  //       }

  //       // When the route /complete-book-flight is translated, take the translated flight
  //       if (
  //         (!this._ObjectUtilsService.isEmptyObject(
  //           this.selectedFlight$.value
  //         ) ||
  //           this.selectedFlight$.value !== '{}') &&
  //         (this._router.url === '/rezerva-zbor' ||
  //           this._router.url === '/complete-book-flight')
  //       ) {
  //         const selectedFlight = data.flights.find(
  //           (flight: any) => flight.id === this.selectedFlight$.value.id
  //         );
  //         this.selectedFlight$.next(selectedFlight);
  //         return; // Return an empty observable or handle accordingly
  //       }

  //       const processedData = { ...data }; // Adjust this line as needed
  //       console.log(processedData);
  //       return of(processedData);
  //     }),
  //     switchMap((data: { flights: any; flightObj: any; oneWay: boolean }) =>
  //       forkJoin(
  //         data.flights.map((flight: any) =>
  //           this.checkFlightPrice(flight, data.flightObj).pipe(
  //             catchError((error) => {
  //               console.error('Error in checkFlightPrice:', error);
  //               return of(null); // Return an empty observable or handle the error accordingly
  //             })
  //           )
  //         )
  //       ).pipe(
  //         map((flights) => ({ ...data, flights })) // Combine mutated flights back into data
  //       )
  //     ),
  //     switchMap((data) =>
  //       data.oneWay
  //         ? this.createFlightHelpersOneWay(data)
  //         : this.createFlightHelpers(data)
  //     )
  //   );
  // }

  // createFlightHelpers(data: any): Observable<any> {
  //   const result = data.flights.map((flight: any) => {
  //     const departureRoute = flight.route.filter(
  //       (route: any) => route.return === 0
  //     );
  //     const arrivalRoute = flight.route.filter(
  //       (route: any) => route.return === 1
  //     );

  //     const departureObj = {
  //       unformmatedDate: flight.utc_departure,
  //       hoursFrom: this._ConverDateUtils.convertISOTimeStringToHours(
  //         flight.utc_departure
  //       ),
  //       duration: flight.duration.departure,
  //       hoursTo: this._ConverDateUtils.convertISOTimeStringToHoursUTC(
  //         flight.local_arrival
  //       ),
  //     };

  //     const arrivalObj = {
  //       unformmatedDate: arrivalRoute[arrivalRoute.length - 1].local_departure,
  //       hoursFrom: this._ConverDateUtils.convertISOTimeStringToHoursUTC(
  //         arrivalRoute[arrivalRoute.length - 1].local_departure
  //       ),
  //       duration: flight.duration.return,
  //       hoursTo: this._ConverDateUtils.convertISOTimeStringToHours(
  //         arrivalRoute[arrivalRoute.length - 1].utc_arrival
  //       ),
  //     };

  //     const dataObj = {
  //       departureRoute: departureRoute,
  //       arrivalRoute: arrivalRoute,
  //       dataId: flight.id,
  //     };

  //     flight._frvlDateConverted = this.convertISOTimeStringFrvl(
  //       departureObj,
  //       arrivalObj,
  //       dataObj,
  //       data.oneWay
  //     );

  //     return flight;
  //   });

  //   console.log(result);

  //   this.selectedDates$.next({
  //     departure: {
  //       day: data.dateSelected.fromDate.day.toString(),
  //       month: data.dateSelected.fromDate.month.toString(),
  //     },
  //     arrival: {
  //       day: data.dateSelected.toDate.day.toString(),
  //       month: data.dateSelected.toDate.month.toString(),
  //     },
  //   });

  //   // For departure flights
  //   this.setDepartureFlightsDates(
  //     result,
  //     data.dateSelected.toDate.day.toString(),
  //     data.flightObj.curr
  //   );

  //   // For return flights
  //   this.setReturnFlightsDates(
  //     result,
  //     data.dateSelected.fromDate.day.toString(),
  //     data.flightObj.curr
  //   );

  //   console.log(data.dateSelected.fromDate);

  //   this.getFlightsBySeletedDate(
  //     data.dateSelected.fromDate.day.toString(),
  //     data.dateSelected.toDate.day.toString(),
  //     result
  //   );

  //   this.allFlights$.next(result);

  //   return result;
  // }
  // createFlightHelpersOneWay(data: any): Observable<any> {
  //   const result = data.flights.map((flight: any) => {
  //     const departureRoute = flight.route.filter(
  //       (route: any) => route.return === 0
  //     );

  //     const departureObj = {
  //       unformmatedDate: flight.utc_departure,
  //       hoursFrom: this._ConverDateUtils.convertISOTimeStringToHours(
  //         flight.utc_departure
  //       ),
  //       duration: flight.duration.departure,
  //       hoursTo: this._ConverDateUtils.convertISOTimeStringToHoursUTC(
  //         flight.local_arrival
  //       ),
  //     };

  //     const arrivalObj = {
  //       unformmatedDate: '',
  //       hoursFrom: '',
  //       duration: 0,
  //       hoursTo: '',
  //     };

  //     const dataObj = {
  //       departureRoute: departureRoute,
  //       arrivalRoute: '',
  //       dataId: flight.id,
  //     };

  //     flight._frvlDateConverted = this.convertISOTimeStringFrvl(
  //       departureObj,
  //       arrivalObj,
  //       dataObj,
  //       data.oneWay
  //     );

  //     return flight;
  //   });

  //   this.selectedDates$.next({
  //     departure: {
  //       day: data.dateSelected.fromDate.day.toString(),
  //       month: data.dateSelected.fromDate.month.toString(),
  //     },
  //     arrival: {
  //       day: '',
  //       month: '',
  //     },
  //   });

  //   console.log(data);
  //   // For departure flights
  //   this.setDepartureFlightsDatesOneWay(result, data.flightObj.curr);

  //   this.getFlightsBySeletedDateOneWay(
  //     data.dateSelected.fromDate.day.toString(),
  //     result
  //   );

  //   this.allFlights$.next(result);

  //   return result;
  // }

  setDepartureFlightsDates(flights: any, dateSelected: any, curr: string) {
    const uniqueDays = new Set();
    let uniqueDaysArr: any[] = [];

    flights.forEach((item: any) => {
      if (!uniqueDays.has(item._frvlDateConverted.departure.time.day)) {
        uniqueDays.add(item._frvlDateConverted.departure.time.day);
        uniqueDaysArr.push({
          day: item._frvlDateConverted.departure.time.day,
          month: item._frvlDateConverted.departure.time.month,
          year: item._frvlDateConverted.departure.time.year,
          fullDate: item._frvlDateConverted.departure.time.fullDate,
          minPrice: this.getMinPrice(
            item._frvlDateConverted.departure.time.day,
            dateSelected.toString(),
            flights
          ),
          curr: curr,
        });
      }
    });
    // this.departureBeforeAndAfterFlightsDates$.next(
    //   uniqueDaysArr.sort((a: any, b: any) => b.day - a.day).reverse()
    // );

    this.departureBeforeAndAfterFlightsDates$.next(
      uniqueDaysArr.sort((a: any, b: any) => {
        const dateA = new Date(a.fullDate);
        const dateB = new Date(b.fullDate);

        // First, compare by year
        if (dateA.getFullYear() !== dateB.getFullYear()) {
          return dateA.getFullYear() - dateB.getFullYear();
        }

        // Then, compare by month
        if (dateA.getMonth() !== dateB.getMonth()) {
          return dateA.getMonth() - dateB.getMonth();
        }

        // Finally, compare by day
        return dateA.getDate() - dateB.getDate();
      })
    );

    console.log(
      uniqueDaysArr.sort((a: any, b: any) => {
        const dateA = new Date(a.fullDate);
        const dateB = new Date(b.fullDate);

        // First, compare by year
        if (dateA.getFullYear() !== dateB.getFullYear()) {
          return dateA.getFullYear() - dateB.getFullYear();
        }

        // Then, compare by month
        if (dateA.getMonth() !== dateB.getMonth()) {
          return dateA.getMonth() - dateB.getMonth();
        }

        // Finally, compare by day
        return dateA.getDate() - dateB.getDate();
      })
    );
  }

  setDepartureDayMinPrice(flights: any, dateSelected: any) {
    this.departureBeforeAndAfterFlightsDates$
      .pipe(
        take(1),
        map((dates) => {
          const departureDay = dates.find(
            (date) => date.day === dateSelected.departure.day
          );
          departureDay.minPrice = this.getMinPrice(
            dateSelected.departure.day,
            dateSelected.arrival.day,
            flights
          );
        })
      )
      .subscribe();
  }

  setDepartureFlightsDatesOneWay(flights: any, curr: string) {
    const uniqueDays = new Set();
    let uniqueDaysArr: any[] = [];

    flights.forEach((item: any) => {
      const fullDate = item._frvlDateConverted.arrival.time.fullDate;
      const departureDay = item._frvlDateConverted.departure.time.day;

      if (!uniqueDays.has(item._frvlDateConverted.departure.time.day)) {
        ``;
        uniqueDays.add(item._frvlDateConverted.departure.time.day);
        uniqueDaysArr.push({
          day: item._frvlDateConverted.departure.time.day,
          month: item._frvlDateConverted.departure.time.month,
          year: item._frvlDateConverted.departure.time.year,
          fullDate: item._frvlDateConverted.departure.time.fullDate,
          minPrice: this.getMinPriceOneWay(
            item._frvlDateConverted.departure.time.day,
            flights
          ),
          curr: curr,
        });
      }
    });

    this.departureBeforeAndAfterFlightsDates$.next(
      uniqueDaysArr.sort((a: any, b: any) => {
        const dateA = new Date(a.fullDate);
        const dateB = new Date(b.fullDate);

        // First, compare by year
        if (dateA.getFullYear() !== dateB.getFullYear()) {
          return dateA.getFullYear() - dateB.getFullYear();
        }

        // Then, compare by month
        if (dateA.getMonth() !== dateB.getMonth()) {
          return dateA.getMonth() - dateB.getMonth();
        }

        // Finally, compare by day
        return dateA.getDate() - dateB.getDate();
      })
    );
  }

  setReturnFlightsDates(flights: any, dateSelected: any, curr: string) {
    const uniqueDays = new Set();
    let uniqueDaysArr: any[] = [];

    const filteredFlights = flights.filter(
      (flight: any) =>
        flight._frvlDateConverted.departure.time.day === dateSelected
    );

    filteredFlights.forEach((item: any) => {
      if (!uniqueDays.has(item._frvlDateConverted.arrival.time.day)) {
        uniqueDays.add(item._frvlDateConverted.arrival.time.day);
        uniqueDaysArr.push({
          day: item._frvlDateConverted.arrival.time.day,
          month: item._frvlDateConverted.arrival.time.month,
          year: item._frvlDateConverted.arrival.time.year,
          fullDate: item._frvlDateConverted.arrival.time.fullDate,
          minPrice: this.getMinPrice(
            dateSelected,
            item._frvlDateConverted.arrival.time.day,
            filteredFlights
          ),
          curr: curr,
        });
      }
    });

    console.log(uniqueDaysArr);

    this.returnBeforeAfterFlightsDates$.next(
      uniqueDaysArr.sort((a: any, b: any) => {
        const dateA = new Date(a.fullDate);
        const dateB = new Date(b.fullDate);

        // First, compare by year
        if (dateA.getFullYear() !== dateB.getFullYear()) {
          return dateA.getFullYear() - dateB.getFullYear();
        }

        // Then, compare by month
        if (dateA.getMonth() !== dateB.getMonth()) {
          return dateA.getMonth() - dateB.getMonth();
        }

        // Finally, compare by day
        return dateA.getDate() - dateB.getDate();
      })
    );
  }

  getFlightsBySeletedDate(selectedDay: any, returnDay: string, flights: any) {
    const flightByDate = flights.filter(
      (flight: any) =>
        flight._frvlDateConverted.departure.time.day === selectedDay &&
        flight._frvlDateConverted.arrival.time.day === returnDay
    );

    console.log(flightByDate);
    this.flights$.next(flightByDate);
    return flightByDate;
  }
  getFlightsBySeletedDateOneWay(selectedDay: any, flights: any) {
    const flightByDate = flights.filter(
      (flight: any) =>
        flight._frvlDateConverted.departure.time.day === selectedDay
    );

    this.flights$.next(flightByDate);
    return flightByDate;
  }

  getMinPrice(selectedDay: any, returnDay: string, flights: any) {
    let minPrice: any;

    const flightByDate = flights.filter(
      (flight: any) =>
        flight._frvlDateConverted.departure.time.day === selectedDay &&
        flight._frvlDateConverted.arrival.time.day === returnDay
    );

    minPrice =
      flightByDate.length > 0
        ? flightByDate.reduce((prev: any, curr: any) =>
            prev['price'] < curr['price'] ? prev : curr
          )
        : '';

    return minPrice.price;
  }
  getMinPriceOneWay(selectedDay: any, flights: any) {
    let minPrice: any;

    const flightByDate = flights.filter(
      (flight: any) =>
        flight._frvlDateConverted.departure.time.day === selectedDay
    );

    minPrice =
      flightByDate.length > 0
        ? flightByDate.reduce((prev: any, curr: any) =>
            prev['price'] < curr['price'] ? prev : curr
          )
        : '';

    return minPrice.price;
  }

  toogleFilterState$(): Observable<string> {
    return this.filtersState$.asObservable();
  }

  createSession() {
    this.sessionId$.next(this.generateUniqueSessionId());
    this.restartInactivityTimer();
  }

  private generateUniqueSessionId(): string {
    // Generate a unique session ID (e.g., UUID).
    return 'your-generated-session-id';
  }

  restartInactivityTimer() {
    clearTimeout(this.inactivityTimer);
    this.inactivityTimer = setTimeout(() => {
      this.expireSession();
    }, 15 * 60 * 1000); // 15 minutes in milliseconds
  }

  expireSession() {
    // Handle session expiration, e.g., trigger new API request, generate a new session ID.
    this.createSession();
  }

  getSessionId(): Observable<string> {
    return this.sessionId$.asObservable();
  }

  checkFlightPrice(flight: any, flightObj: any): Observable<any> {
    const headers = new HttpHeaders({
      accept: 'application/json',
      apikey: environment.KIWI_KEY,
    });

    const adultParts = flightObj.adult_hold_bag.split(',');
    const childParts = flightObj.child_hold_bag.split(',');

    const adultSum = adultParts.reduce((acc: any, val: any) => acc + val, 0);
    const childSum = childParts.reduce((acc: any, val: any) => acc + val, 0);

    const params = new HttpParams({
      fromObject: {
        booking_token: flight.booking_token.toString(),
        bnum: parseInt(adultSum) + parseInt(childSum ?? 0),
        adults: flightObj.adults.toString(),
        children: flightObj.children.toString(),
        infants: flightObj.infants.toString(),
        currency: flightObj.curr,
      },
    });

    return this._httpClient
      .get<any>('https://api.tequila.kiwi.com/v2/booking/check_flights', {
        headers,
        params,
      })
      .pipe(
        take(1),
        map((data) => {
          flight.price = Math.round(data.conversion.amount);
          flight.curr = flightObj.curr;
          return flight;
        })
      );
  }

  // checkPrice(booking_token: any) {
  //   return this._SearchFlightsService.flightObj$.pipe(
  //     take(1),
  //     switchMap((flightObj: FlightObj) => {
  //       const headers = new HttpHeaders({
  //         accept: 'application/json',
  //         apikey: environment.KIWI_KEY,
  //       });

  //       const adultParts = flightObj.adult_hold_bag.split(',');
  //       const childParts = flightObj.child_hold_bag.split(',');

  //       const adultSum = adultParts.reduce(
  //         (acc, val) => acc + parseInt(val),
  //         0
  //       );
  //       const childSum = childParts.reduce(
  //         (acc, val) => acc + parseInt(val),
  //         0
  //       );

  //       const params = new HttpParams({
  //         fromObject: {
  //           booking_token: booking_token.toString(),
  //           bnum: (adultSum + childSum).toString(),
  //           adults: flightObj.adults.toString(),
  //           children: flightObj.children.toString(),
  //           infants: flightObj.infants.toString(),
  //           currency: flightObj.curr,
  //         },
  //       });

  //       return this._httpClient.get<any>(
  //         'https://api.tequila.kiwi.com/v2/booking/check_flights',
  //         { headers, params }
  //       );
  //     })
  //   );
  // }

  // Function to update the flightObj$
  updateFlightObj(newFlightObj: any) {
    console.log(newFlightObj);
    //this.flightObj$.next(newFlightObj);
  }
}
