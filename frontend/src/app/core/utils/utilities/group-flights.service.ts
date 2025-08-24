import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GroupFlightsService {
  // groupFlights(flights: any) {
  //     const groups = flights.reduce(
  //       (result: Record<string, any>, flight: any) => {
  //         const departureDate =
  //           this.datePipe.transform(flight.utc_departure, 'MM/dd/yyyy') ?? '';
  //         const filterDate = this.datePipe.transform(
  //           flight.utc_departure,
  //           'd MMM'
  //         );
  //         const monthFlight = this.datePipe.transform(departureDate, 'MMM');
  //         const dayFlight = this.datePipe.transform(flight.utc_departure, 'd');
  //         if (!result[departureDate]) {
  //           result[departureDate] = {
  //             date: departureDate,
  //             groups: {},
  //             filterDate: filterDate,
  //             monthFlight: monthFlight,
  //             dayFlight: dayFlight,
  //           };
  //         }
  //         const groupKey = `departureDay: ${dayFlight}, arrivalDay: ${flight._frvlDateConverted.arrival.time.day}`;
  //         result[departureDate].groups[groupKey]
  //           ? result[departureDate].groups[groupKey].data.push(flight)
  //           : (result[departureDate].groups[groupKey] = {
  //               departureDay: flight._frvlDateConverted.departure.time.day,
  //               arrivalDay: flight._frvlDateConverted.arrival.time.day,
  //               data: [flight],
  //             });
  //         return result;
  //       },
  //       {}
  //     );
  //     return groups;
  //     //return this.groupFlightsByDate(groups);
  //   }
  //   groupFlightsByDate(groups: any): Observable<any> {
  //     const result = Object.keys(groups).map((departureDate) => {
  //       const groupObject = groups[departureDate];
  //       const groupArray = Object.keys(groupObject.groups).map((groupKey) => {
  //         return groupObject.groups[groupKey];
  //       });
  //       console.log(groupArray);
  //       const modifiedFlights = groupArray.map((group) => {
  //         const flightObservables = group.data.map((flight: any) =>
  //           this.checkFlightPrice(flight, this.flightObj$.value).pipe(take(1))
  //         );
  //         return forkJoin(flightObservables);
  //       });
  //       return forkJoin(modifiedFlights).pipe(
  //         map((flightsArray) => {
  //           //this.setReturnFlightsDates(flightsArray, groupObject.dayFlight);
  //           return {
  //             monthFlight: groupObject.monthFlight,
  //             dayFlight: groupObject.dayFlight,
  //             departureDay: groupObject.dayFlight,
  //             arrivalDay: groupArray[0].arrivalDay,
  //             flights: flightsArray,
  //           };
  //         })
  //       );
  //     });
  //     return forkJoin(result);
  //   }
}
