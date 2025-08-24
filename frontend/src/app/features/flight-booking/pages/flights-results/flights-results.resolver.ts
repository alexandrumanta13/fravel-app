import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, forkJoin, Observable, of, switchMap, take } from 'rxjs';
import { FlightsResultsService } from './flights-results.service';
// import { StepperService } from 'src/app/shared/components/stepper/stepper.service';
// import { SearchFlightsService } from '../search-flights/search-flights.service';

@Injectable({
  providedIn: 'root',
})
export class FlightsResultsResolver {
  constructor(
    private _FlightsResultsService: FlightsResultsService,
    // private _SearchFlightsService: SearchFlightsService,
    // private _StepperService: StepperService,
    private router: Router
  ) {}

  // resolve(): Observable<any> {
  //   // return this._SearchFlightsService.flightObj$.pipe(
  //   //   take(1),
  //   //   switchMap((obj) => {
  //   //     if (!Object.keys(obj).length) {
  //   //       this.router.navigate(['/']);
  //   //       return of(null); // Return an observable with null value if info is empty
  //   //     }

  //   //     // Assuming returnFlights is a method of _FlightsResultsService
  //   //     return this._FlightsResultsService.returnFlights(obj).pipe(
  //   //       catchError((error) => {
  //   //         console.error('Error fetching flights:', error);
  //   //         // Handle error as needed
  //   //         return of(null); // Return an observable with null value on error
  //   //       })
  //   //     );
  //   //   }),
  //   //   switchMap(() => {
  //   //     this._StepperService.step$.next(4);
  //   //     return of(null); // Return an observable with null value as the final result
  //   //   })
  //   // );
  // }
}
