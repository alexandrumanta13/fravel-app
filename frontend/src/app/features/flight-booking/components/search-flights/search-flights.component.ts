import { Component, Inject, OnInit, PLATFORM_ID, effect } from '@angular/core';
import { Router } from '@angular/router';

import {
  IBagsOptions,
  IBagsExtendedOptions,
  ISerializeResult,
} from '../select-persons/select-persons.type';

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SharedService } from 'src/app/shared/shared.service';
import { Airport, FlightSearchObj } from 'src/app/shared/types';
// Legacy: import { KiwiService } from 'src/app/_reference/kiwi-legacy/kiwi.service';
import { TravelFusionService } from 'src/app/core/api/travel-fusion/travel-fusion.service';

@Component({
  standalone: true,
  selector: 'app-search-flights',
  templateUrl: './search-flights.component.html',
  styleUrls: ['./search-flights.component.scss'],
  imports: [CommonModule],
})
export class SearchFlightsComponent implements OnInit {
  destinationCity: Airport = {} as Airport;
  departureCity: Airport = {} as Airport;
  dateFrom: number = 0;
  dateTo: number = 0;
  isFlightTypeOneWay: boolean = false;
  persons: IBagsOptions = {} as IBagsOptions;
  bags: IBagsExtendedOptions = {} as IBagsExtendedOptions;
  flightSearch: FlightSearchObj = {} as FlightSearchObj;

  constructor(
    private _SharedService: SharedService,
    // Legacy: private _KiwiService: KiwiService,
    private _TravelFusionService: TravelFusionService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        this.destinationCity =
          this._SharedService.flightSearch().destinationCity;
        this.departureCity = this._SharedService.flightSearch().departureCity;
        this.dateFrom = this._SharedService.flightSearch().dateFrom;
        this.dateTo = this._SharedService.flightSearch().dateTo;
        this.isFlightTypeOneWay =
          this._SharedService.flightSearch().isFlightTypeOneWay;
        this.persons =
          this._SharedService.flightSearch().infoSerializedOptionsPersons;
        this.bags =
          this._SharedService.flightSearch().infoSerializedOptionsBags;
      });
    }
  }

  ngOnInit(): void {}

  async searchFlights() {
    console.log('asdadas');
    try {
      this._SharedService.setStepFn(4);
      // await this._KiwiService.searchFlights();
      await this._TravelFusionService.searchFlights();
    } catch (err) {
      console.log(err);
      //TODO: implement error message service
    }
  }
}
