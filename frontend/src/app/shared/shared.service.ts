import { Injectable, effect, signal } from '@angular/core';
import { Airport, Airports, FlightSearchObj } from './types';
import {
  IBagsExtendedOptions,
  IBagsOptions,
  ISerializeResult,
} from '../modules/user/select-persons/select-persons.type';
import { ConverDateUtils } from '../core/utilities/convert-date-utils.service';
import { Router } from '@angular/router';
import { RoutesService } from '../core/services';
import { Language } from '../core/types';
import { UIStates } from './types/ui-states.type';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  currentStep = signal(2);
  departureAirports = signal({} as Airports[]);
  destinationAirports = signal({} as Airports[]);
  queryParams = signal({});
  flightSearch = signal({} as FlightSearchObj);
  uiState = signal({} as UIStates);

  constructor(
    private _ConverDateUtils: ConverDateUtils,
    private _RoutesService: RoutesService,
    private router: Router
  ) {
    const initFlightObj: FlightSearchObj = {
      departureCity: {} as Airport,
      destinationCity: {} as Airport,
      dateFrom: 0,
      dateTo: 0,
      isFlightTypeOneWay: false,
      infoSerialized: {} as ISerializeResult,
      infoSerializedOptionsPersons: {} as IBagsOptions,
      infoSerializedOptionsBags: {} as IBagsExtendedOptions,
      daysToAdd: 0,
      cabinClass: 'M',
      dateFromSubstract: 0,
      dateToAdd: 0,
      returnDateFromSubstract: 0,
      returnDateToAdd: 0,
      defaultLanguage: {} as Language,
    };

    this.flightSearch.set(initFlightObj);

    const initUIStates = {
      toggleLanguageMenu: false,
      toggleStepper: false,
      toggleFilter: false,
      toggleLoader: false,
      toggleMenu: false,
      toggleSelectPersons: false,
      toggleSelectDate: false,
      isMobile: true,
      currentStep: 1,
      screenWidth: 0,
      screenHeight: 0,
      toggleDeparture: false,
      toggleDestination: false,
      toggleSearchFlight: false,
    };

    this.uiState.set(initUIStates);
  }

  setStepFn(step: number) {
    const previousStep = this.currentStep();
    this.currentStep.set(step);
    this.navigateBetweenSteps(previousStep);
  }

  navigateBetweenSteps(previousStep: number) {
    if (this.currentStep() === 1) {
      if (previousStep > 3) {
        this.router.navigate(['/']);
      }

      this.updateUiStatesObjFn([
        { toggleStepper: false },
        { toggleSelectPersons: false },
        { toggleSelectDate: false },
        { toggleSearchFlight: false },
      ]);
    } else if (this.currentStep() === 2) {
      this._RoutesService.addQueryParamsWithoutReload(
        {
          departure: this.flightSearch().departureCity.city.name,
        },
        this.flightSearch().defaultLanguage.key
      );

      this.updateUiStatesObjFn([
        { toggleStepper: false },
        { toggleSelectPersons: true },
        { toggleSelectDate: false },
        { toggleSearchFlight: false },
      ]);
      this.animateStepper();
    } else if (this.currentStep() === 3) {
      this._RoutesService.addQueryParamsWithoutReload(
        this.managePersonsAndLugagges(),
        this.flightSearch().defaultLanguage.key
      );

      this.updateUiStatesObjFn([
        { toggleStepper: false },
        { toggleSelectPersons: false },
        { toggleSelectDate: true },
        { toggleSearchFlight: false },
      ]);
      this.animateStepper();
    } else if (this.currentStep() === 4) {
      this._RoutesService.addQueryParamsWithoutReload(
        {
          dateFrom: this._ConverDateUtils.converDateForUrl(
            this.flightSearch().dateFrom
          ),
          dateTo: this._ConverDateUtils.converDateForUrl(
            this.flightSearch().dateTo
          ),
        },
        this.flightSearch().defaultLanguage.key
      );
      this.updateUiStatesObjFn([
        { toggleStepper: false },
        { toggleSelectPersons: false },
        { toggleSelectDate: false },
        { toggleSearchFlight: false },
        { toggleLoader: true },
      ]);

      this.flightSearch().defaultLanguage.key === 'en'
        ? this.router.navigate(['/flights-results'])
        : this.router.navigate(['/lista-zboruri']);
    }
  }

  animateStepper() {
    setTimeout(() => {
      this.updateUiStatesObjFn([{ toggleStepper: true }]);
    }, 280);
  }

  updateFlightObjFn(key: string, value: any) {
    this.setQueryParamsFn({ [key]: value });
    this.flightSearch.set({
      ...this.flightSearch(),
      [key]: value,
    });
  }

  updateUiStatesObjFn(states: any) {
    states.forEach((state: UIStates) => {
      this.uiState.set({
        ...this.uiState(),
        ...state,
      });
    });
  }

  setSearchDepartureAirportsFn(airports: Airports[]) {
    this.departureAirports.set(airports);
  }

  setSearchDestinationAirportsFn(airports: Airports[]) {
    this.destinationAirports.set(airports);
  }

  daysToAddFn() {
    const today = this._ConverDateUtils.setHours(new Date());

    /**  Checking if the date selected by the user is today or tomorrow.
     * If it is today, it will add 5 days to the date selected by the user.
     * If it is tomorrow, it will add 4 days to the date selected by the user.
     * If it is not today or tomorrow, it will add 2 days to the date selected by the user.
     * */

    if (
      this._ConverDateUtils.differenceInDays(
        this.flightSearch().dateFrom,
        today
      ) === 0
    ) {
      this.updateFlightObjFn('daysToAdd', 5);
    } else if (
      this._ConverDateUtils.differenceInDays(
        this.flightSearch().dateFrom,
        today
      ) === 1
    ) {
      this.updateFlightObjFn('daysToAdd', 4);
    } else {
      this.updateFlightObjFn('daysToAdd', 2);
    }

    this.addDaysBeforeAndAfter();
  }

  addDaysBeforeAndAfter() {
    this.updateFlightObjFn(
      'dateFromSubstract',
      this._ConverDateUtils.substractDays(this.flightSearch().dateFrom, 2)
    ); // always add 2 days before no matter if is today or towmorrow

    this.updateFlightObjFn(
      'dateToAdd',
      this._ConverDateUtils.addDays(
        this.flightSearch().dateFrom,
        this.flightSearch().daysToAdd
      )
    );

    if (!this.flightSearch().isFlightTypeOneWay) {
      this.updateFlightObjFn(
        'returnDateFromSubstract',
        this._ConverDateUtils.substractDays(this.flightSearch().dateTo, 2)
      );

      this.updateFlightObjFn(
        'returnDateToAdd',
        this._ConverDateUtils.addDays(
          this.flightSearch().dateTo,
          this.flightSearch().daysToAdd
        )
      );
    } else {
      this.updateFlightObjFn('returnDateFromSubstract', 0);
      this.updateFlightObjFn('returnDateToAdd', 0);
    }
  }

  managePersonsAndLugagges() {
    const flightSearch = this.flightSearch();
    const personsAndLuggages = {
      destination: flightSearch.destinationCity.city.name,
      cabinClass: flightSearch.cabinClass,
      adults: flightSearch.infoSerializedOptionsPersons.selectedAdults,
    };

    const addPropertyIfNotZero = (
      obj: any,
      propName: string,
      propValue: number
    ) => {
      if (propValue > 0) {
        obj[propName] = propValue;
      }
    };

    addPropertyIfNotZero(
      personsAndLuggages,
      'infants',
      flightSearch.infoSerializedOptionsPersons.selectedInfants
    );
    addPropertyIfNotZero(
      personsAndLuggages,
      'childrens',
      flightSearch.infoSerializedOptionsPersons.selectedChildren
    );
    addPropertyIfNotZero(
      personsAndLuggages,
      'holdBags',
      flightSearch.infoSerializedOptionsPersons.bags.holdBagsSelected
    );
    addPropertyIfNotZero(
      personsAndLuggages,
      'handBags',
      flightSearch.infoSerializedOptionsPersons.bags.handBagsSelected
    );

    return personsAndLuggages;
  }

  setQueryParamsFn(params: {}) {
    this.queryParams.set(params);
  }

  // openFilterFn(open: boolean) {
  //   this.openFilterState.set(open);
  // }

  // isEmptyObject(obj: any): boolean {
  //   return Object.keys(obj).length === 0;
  // }
}
