import { Component, Inject, PLATFORM_ID, effect } from '@angular/core';
import { Airport, Airports } from '../../../shared/types';
import { SharedService } from 'src/app/shared/shared.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { isPlatformBrowser } from '@angular/common';
import { AirportsService } from 'src/app/core/services/airports/airports.service';
@Component({
  standalone: true,
  selector: 'app-select-destination',
  templateUrl: './select-destination.component.html',
  styleUrls: ['./select-destination.component.scss'],
  imports: [SharedModule],
})
export class SelectDestinationComponent {
  screenHeight: number = 0;
  screenWidth: number = 0;
  toggleMenu: boolean = false;
  destination: string = '';
  airports: Airports[] = [];
  destinationCity: Airport = {} as Airport;

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
        this.airports = this._SharedService.destinationAirports();
        this.destinationCity =
          this._SharedService.flightSearch().destinationCity;
      });
    }
  }

  searchDestination() {
    if (this.destination.length > 0) {
      this._AirportsService.getAirportsByCity(this.destination, 'destination');
    }
  }

  selectDestination(airport: Airport) {
    this._SharedService.updateFlightObjFn('destinationCity', airport);
    const dynamicQueryParams = {
      destination: airport.city.name,
    };

    this._SharedService.setQueryParamsFn(dynamicQueryParams);

    this.toggleDestination();
    if (Object.keys(this.destinationCity).length) {
      this._SharedService.setStepFn(2);
    }
  }

  toggleDestination() {
    this._SharedService.updateUiStatesObjFn([{ toggleDestination: false }]);
  }
}
