import { Component, Inject, PLATFORM_ID, effect } from '@angular/core';

import { Airport, TopDestinations } from '../../../shared/types';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SharedService } from 'src/app/shared/shared.service';
import { AirportsService } from 'src/app/core/services/airports/airports.service';
import { topDestinations } from 'src/app/core/providers/top-destinations';
import { SelectDateComponent } from '../select-date/select-date.component';
import { SelectDepartureComponent } from '../select-departure/select-departure.component';
import { SelectDestinationComponent } from '../select-destination/select-destination.component';
import { SelectPersonsComponent } from '../select-persons/select-persons.component';
import { RoutesService } from 'src/app/core/services';

@Component({
  standalone: true,
  selector: 'app-book-flight',
  templateUrl: './book-flight.component.html',
  styleUrls: ['./book-flight.component.scss'],
  imports: [
    CommonModule,
    SelectDepartureComponent,
    SelectDestinationComponent,
    SelectPersonsComponent,
    SelectDateComponent,
  ],
})
export class BookFlightComponent {
  toggleMenu: boolean = false;
  topDestinations: TopDestinations[] = topDestinations;
  isMobile: boolean = true;
  departureCity: Airport = {} as Airport;
  destinationCity: Airport = {} as Airport;

  constructor(
    private _SharedService: SharedService,
    private _RoutesService: RoutesService,
    private _AirportsService: AirportsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        this.toggleMenu = this._SharedService.uiState().toggleMenu;
        this.isMobile = this._SharedService.uiState().isMobile;
        this.departureCity = this._SharedService.flightSearch().departureCity;
        this.destinationCity =
          this._SharedService.flightSearch().destinationCity;

        // let dynamicQueryParams: ParamsObject = {};

        // if (Object.keys(this.departureCity).length > 0) {
        //   dynamicQueryParams = {
        //     ...{
        //       cabinClass: this._SharedService.cabinClass(),
        //       departure: this.departureCity.city.name,
        //     },
        //   };
        // }
        // if (Object.keys(this.destinationCity).length > 0) {
        //   dynamicQueryParams = {
        //     ...{ destination: this.destinationCity.city.name },
        //   };
        // }
        // this._SharedService.setQueryParamsFn(dynamicQueryParams);

        // this._RoutesService.addQueryParamsWithoutReload(
        //   dynamicQueryParams,
        //   this._SharedService.defaultLanguage().key
        // );
      });
    }
  }

  ngAfterViewInit() {
    this._AirportsService.getNearbyAirports();
  }

  removeSelectedDestination() {
    this._SharedService.updateFlightObjFn('destinationCity', {} as Airport);
  }

  toggleDepartureFn() {
    this._SharedService.updateUiStatesObjFn([{ toggleDeparture: true }]);
  }

  toggleDestination() {
    this._SharedService.updateUiStatesObjFn([{ toggleDestination: true }]);
  }

  selectDestination(iata_id: string) {
    this._AirportsService.getAirportsByCity(iata_id, 'destination').then(() => {
      const foundAirport = this.findAirportByIATAId(
        this._SharedService
          .destinationAirports()
          .flatMap((airport) => airport.locations),
        iata_id
      );

      this._SharedService.updateFlightObjFn('destinationCity', foundAirport);

      // // go to next step
      if (Object.keys(this.departureCity).length) {
        this._SharedService.setStepFn(2);
      }
    });
  }

  findAirportByIATAId(airports: Airport[], iata_id: string): Airport {
    return (
      airports.find((airport) => airport.id === iata_id) || ({} as Airport)
    );
  }

  goToSelectPersons() {
    this._SharedService.setStepFn(2);
  }
}
