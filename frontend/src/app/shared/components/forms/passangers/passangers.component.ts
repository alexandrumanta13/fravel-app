import { Component, OnDestroy, OnInit } from '@angular/core';
import { SelectPersonsService } from 'src/app/modules/user/select-persons/select-persons.service';
import { PassangersService } from './passangers.service';
import { FlightsResultsService } from 'src/app/modules/user/flights-results/flights-results.service';
import {
  BehaviorSubject,
  Subject,
  combineLatest,
  map,
  take,
  takeUntil,
} from 'rxjs';
import { PassengerInfo } from './passanger.type';

@Component({
  selector: 'app-passangers',
  templateUrl: './passangers.component.html',
  styleUrls: ['./passangers.component.scss'],
})
export class PassangersComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  passangers$ = new BehaviorSubject<any>([]);

  constructor(
    private _SelectPersonsService: SelectPersonsService,
    private _FlightsResultsService: FlightsResultsService
  ) {}

  ngOnInit(): void {
    this.createPassangerList();
  }

  createPassangerList() {
    //const passengers: Passenger[] = [];
    console.log(this._SelectPersonsService.infoSerialized$.value);
    console.log(this._SelectPersonsService.infoSerializedOptionsPersons$.value);
    console.log(this._FlightsResultsService.selectedFlight$.value);

    const passengers: PassengerInfo[] = [];

    combineLatest([
      this._SelectPersonsService.infoSerializedOptionsPersons$,
      this._SelectPersonsService.infoSerialized$,
    ])
      .pipe(
        take(1),
        map(([infoSerializedOptionsPersons, infoSerialized]) => {
          const newPassengers: PassengerInfo[] = [];

          // Function to split and parse comma-separated values
          const parseCommaSeparated = (value: string): number[] => {
            return value.split(',').map((v) => parseInt(v, 10));
          };

          // Add adult passengers
          const adultData = infoSerialized.serialized.adult || {};
          const handBagsAdult = parseCommaSeparated(adultData.handBags || '0');
          const holdBagsAdult = parseCommaSeparated(adultData.holdBags || '0');
          for (
            let i = 0;
            i < infoSerializedOptionsPersons.selectedAdults;
            i++
          ) {
            const passenger: PassengerInfo = {
              type: 'adult',
              handBags: handBagsAdult[i] || 0,
              holdBags: holdBagsAdult[i] || 0,
            };
            newPassengers.push(passenger);
          }

          // Add child passengers
          const childrenData = infoSerialized.serialized.children || {};
          const handBagsChild = parseCommaSeparated(
            childrenData.handBags || '0'
          );
          const holdBagsChild = parseCommaSeparated(
            childrenData.holdBags || '0'
          );
          for (
            let i = 0;
            i < infoSerializedOptionsPersons.selectedChildren;
            i++
          ) {
            const passenger: PassengerInfo = {
              type: 'child',
              handBags: handBagsChild[i] || 0,
              holdBags: holdBagsChild[i] || 0,
            };
            newPassengers.push(passenger);
          }

          // Add infant passengers (with no luggage)
          // Check if infant data exists and add infant passengers
          if (infoSerializedOptionsPersons.selectedInfants > 0) {
            //const infantsData = data2.serialized.infant || {};
            for (
              let i = 0;
              i < infoSerializedOptionsPersons.selectedInfants;
              i++
            ) {
              const passenger: PassengerInfo = {
                type: 'infant',
                handBags: 0, // No handbags
                holdBags: 0, // No holdbags
              };
              newPassengers.push(passenger);
            }
          }

          passengers.push(...newPassengers); // Merge newPassengers into the existing passengers array
        })
      )

      .subscribe(() => {
        // Now, the passengers array is populated based on the data from the Observables
        this.passangers$.next(passengers);
        console.log(passengers);
      });
  }

  ngOnDestroy() {
    this._unsubscribeAll.next('');
    this._unsubscribeAll.complete();
  }
}
