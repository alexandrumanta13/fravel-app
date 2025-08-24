import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, combineLatest, map, switchMap, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { Airports } from '../../../shared/types';
import { FlightsResultsService } from '../flights-results/flights-results.service';
import { SelectPersonsService } from '../select-persons/select-persons.service';

@Injectable({
  providedIn: 'root',
})
export class CompleteBookFlightService {
  constructor(
    private _httpClient: HttpClient,
    private _FlightsResultsService: FlightsResultsService,
    private _SelectPersonsService: SelectPersonsService
  ) {}

  // checkFlight(bookingToken: string) {
  //   const headers = new HttpHeaders({
  //     accept: 'application/json',
  //     apikey: environment.KIWI_KEY,
  //   });

  //   combineLatest([
  //     this._FlightsResultsService.selectedFlight$,
  //     this._SelectPersonsService.infoSerializedOptionsPersons$,
  //     this._SelectPersonsService.infoSerializedOptionsBags$,
  //     this._SelectPersonsService.infoSerialized$,
  //     this._I18nService.defaultLanguage$,
  //   ]).pipe(
  //     take(1),
  //     map(
  //       ([
  //         selectedFlight$,
  //         infoSerializedOptionsPersons$,
  //         infoSerializedOptionsBags$,
  //         infoSerialized$,
  //         defaultLanguage$
  //       ]) => ({
  //         selectedFlight: selectedFlight$,
  //         persons: infoSerializedOptionsPersons$,
  //         bags: infoSerializedOptionsBags$,
  //         infoSerialized: infoSerialized$,
  //         defaultLanguage: defaultLanguage$
  //       })
  //     ),
  //     tap((data) => {
  //       console.log(data);
  //       const params = new HttpParams({
  //         fromObject: {
  //           booking_token: bookingToken,
  //           bnum: data.infoSerialized.serialized.adult.holdBags,
  //           adults: data.persons.selectedAdults,
  //           children: data.persons.selectedChildren,
  //           infants: data.persons.selectedInfants,
  //           currency: data.defaultLanguage.defaultCurrency,
  //         },
  //       });
  //       this._httpClient
  //         .get<Airports>(
  //           'https://api.tequila.kiwi.com/v2/booking/check_flights',
  //           {
  //             headers: headers,
  //             params: params,
  //           }
  //         )
  //         .pipe(
  //           take(1),
  //           tap((airports: any) => {
  //             console.log(airports);
  //           })
  //         );
  //     })
  //   );
  // }

  checkFlight(): Observable<any> {
    return combineLatest([
      this._FlightsResultsService.selectedFlight$,
      this._SelectPersonsService.infoSerializedOptionsPersons$,
      this._SelectPersonsService.infoSerializedOptionsBags$,
      this._SelectPersonsService.infoSerialized$,
      // this._I18nService.defaultLanguage$,
    ]).pipe(
      take(1),
      map(
        ([
          selectedFlight$,
          infoSerializedOptionsPersons$,
          infoSerializedOptionsBags$,
          infoSerialized$,
          // defaultLanguage$,
        ]) => ({
          selectedFlight: selectedFlight$,
          persons: infoSerializedOptionsPersons$,
          bags: infoSerializedOptionsBags$,
          infoSerialized: infoSerialized$,
          // defaultLanguage: defaultLanguage$,
        })
      ),
      switchMap((data) =>
        this.makeFlightRequest(data.selectedFlight.booking_token, data)
      )
    );
  }

  private makeFlightRequest(bookingToken: string, data: any): Observable<any> {
    const headers = new HttpHeaders({
      accept: 'application/json',
      apikey: environment.KIWI_KEY,
    });

    const holdBagsInfo = data.infoSerialized.serialized;

    const adultHoldBags = holdBagsInfo.adult?.holdBags || '';
    const childHoldBags = holdBagsInfo.children?.holdBags || '';

    const adultParts = adultHoldBags.split(',');
    const childParts = childHoldBags ? childHoldBags.split(',') : [];

    const adultSum = adultParts.reduce(
      (acc: number, val: string) => acc + parseInt(val),
      0
    );
    const childSum = childParts.reduce(
      (acc: number, val: string) => acc + parseInt(val),
      0
    );

    const params = new HttpParams({
      fromObject: {
        booking_token: bookingToken,
        bnum: adultSum + childSum,
        adults: data.persons.selectedAdults,
        children: data.persons.selectedChildren,
        infants: data.persons.selectedInfants || 0,
        currency: data.defaultLanguage.defaultCurrency,
      },
    });

    return this._httpClient.get<any>(
      'https://api.tequila.kiwi.com/v2/booking/check_flights',
      { headers, params }
    );
  }
}
