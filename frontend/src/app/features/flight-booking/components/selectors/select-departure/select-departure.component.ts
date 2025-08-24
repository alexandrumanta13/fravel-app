import { Component, Inject, PLATFORM_ID, effect } from '@angular/core';

import { Airport, Airports } from '../../../shared/types';

import { isPlatformBrowser } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedService } from 'src/app/shared/shared.service';
import { AirportsService } from 'src/app/core/services/airports/airports.service';

@Component({
  standalone: true,
  selector: 'app-select-departure',
  templateUrl: './select-departure.component.html',
  styleUrls: ['./select-departure.component.scss'],
  imports: [SharedModule],
})
export class SelectDepartureComponent {
  screenHeight: number = 0;
  screenWidth: number = 0;
  toggleMenu: boolean = false;
  departure: string = '';
  airports: Airports[] = [];
  departureCity: Airport = {} as Airport;

  constructor(
    private _SharedService: SharedService,
    private _AirportsService: AirportsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        this.toggleMenu = this._SharedService.uiState().toggleMenu;
        this.screenHeight = this._SharedService.uiState().screenHeight;
        this.screenWidth = this._SharedService.uiState().screenWidth;
        this.airports = this._SharedService.departureAirports();
        this.departureCity = this._SharedService.flightSearch().departureCity;
      });
    }
  }

  searchDeparture() {
    if (this.departure.length > 0) {
      this._AirportsService.getAirportsByCity(this.departure, 'departure');
    }
  }

  selectDeparture(airport: Airport) {
    this._SharedService.updateFlightObjFn('departureCity', airport);
    this.toggleDeparture();
  }

  toggleDeparture() {
    this._SharedService.updateUiStatesObjFn([{ toggleDeparture: false }]);
  }
}
