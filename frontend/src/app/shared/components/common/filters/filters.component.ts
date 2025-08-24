import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { distinctUntilChanged, tap } from 'rxjs/operators';
import { LoaderService } from 'src/app/core/services';

import { FlightsResultsService } from 'src/app/modules/user/flights-results/flights-results.service';
import { SelectDateService } from 'src/app/modules/user/select-date/select-date.service';
import { SelectPersonsService } from 'src/app/modules/user/select-persons/select-persons.service';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { Language, Languages } from 'src/app/core/types';
import { Airport } from 'src/app/shared/types';
import {
  IBagsOptions,
  IBagsExtendedOptions,
  ISerializeResult,
} from 'src/app/modules/user/select-persons/select-persons.type';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
  animations: [
    trigger('toggleLanguage', [
      state(
        'closed',
        style({
          opacity: 0,
          transform: 'translate3d(0, 45vh, 0)',
        })
      ),
      state(
        'open',
        style({
          opacity: 1,
          transform: 'translate3d(0, 100vh, 0)',
        })
      ),
      transition('* <=> *', [animate(300)]),
    ]),
    trigger('toggleOverlay', [
      state(
        'closed',
        style({
          opacity: 0,
        })
      ),
      state(
        'open',
        style({
          opacity: 1,
        })
      ),
      transition('* <=> *', [animate(300)], { params: { delay: 0 } }),
    ]),
    trigger('close', [
      state(
        'closed',
        style({
          transform: 'rotate(360deg)',
        })
      ),
      transition('* <=> *', [
        animate('0.2s ease-out', style({ transform: 'rotate(180deg)' })),
      ]),
    ]),
  ],
})
export class FiltersComponent implements OnInit {
  state: string = 'closed';
  selectedDeparture$ = new BehaviorSubject<any>('');
  selectedDestination$ = new BehaviorSubject<Airport>({} as Airport);
  oneWay$ = new BehaviorSubject<boolean>(false);
  dateSelected$ = new BehaviorSubject<any>('');
  persons$ = new BehaviorSubject<IBagsOptions>({} as IBagsOptions);
  bags$ = new BehaviorSubject<IBagsExtendedOptions>({} as IBagsExtendedOptions);
  infoSerialized$ = new BehaviorSubject<ISerializeResult>(
    {} as ISerializeResult
  );
  defaultLanguage$ = new BehaviorSubject<Languages>({} as Language);
  classSelected$ = new BehaviorSubject<string>('');
  dateComponentState$ = new BehaviorSubject<boolean>(false);
  flightType: boolean = false;

  defaultlanguage: any = {
    defaultCurrency: 'RON',
    locale: 'ro_RO',
  };

  constructor(
    private _FlightsResultsService: FlightsResultsService,

    private _SelectDateService: SelectDateService,
    private _SelectPersonsService: SelectPersonsService,

    // public _translate: TranslateService,
    private _LoaderService: LoaderService,
    private router: Router
  ) {
    this.oneWay$ = this._SelectDateService.oneWay$;
    this.dateSelected$ = this._SelectDateService.dateSelected$;
    this.persons$ = this._SelectPersonsService.infoSerializedOptionsPersons$;
    this.bags$ = this._SelectPersonsService.infoSerializedOptionsBags$;
    this.infoSerialized$ = this._SelectPersonsService.infoSerialized$;

    this.flightType = this._SelectDateService.oneWay$.getValue();
  }

  ngOnInit(): void {
    // this._I18nService.defaultLanguage$.pipe(
    //   distinctUntilChanged(),
    //   tap((lang: Language) => {
    //     this.defaultlanguage = lang;
    //   })
    // );
    // this._I18nService
    //   .defaultLanguageChanged$()
    //   .pipe(
    //     distinctUntilChanged(),
    //     tap((lang: any) => {
    //       // this._translate.use(lang.key);
    //       // this._translate.setDefaultLang(lang.key);
    //       // this.dateComponentState$.next(false);
    //     })
    //   )
    //   .subscribe();
    // // .subscribe((lang) =>
    // //   setTimeout(() => {
    // //     // this.dateComponentState$.next(true);
    // //   }, 10)
    // // );

    this._FlightsResultsService
      .toogleFilterState$()
      .pipe(distinctUntilChanged())
      .subscribe((state: string) => {
        this.toggleFilters(state);
      });
  }

  selectClass(classType: string) {
    this.classSelected$.next(classType);
    // this._BookFlightService.selectedClass$.next(classType);
  }

  toggleFilters(state: string) {
    this.state = state;
    this._FlightsResultsService.filtersState$.next(state);
  }

  flightTypeChanged(event: Event) {
    this.flightType = !this.flightType;
    this._SelectDateService.oneWay$.next(!this.flightType ? true : false);
    //  this.dateComponentState$.next(false);
    // setTimeout(() => {
    //   //this.dateComponentState$.next(true);
    // }, 10);
  }

  toggleDeparture() {
    // this._BookFlightService.departureState$.next(true);
  }

  toggleDestination() {
    // this._BookFlightService.destinationMenuState$.next(true);
  }

  togglePersons() {
    this._SelectPersonsService.personsSelectedState$.next(true);
  }

  toggleDates() {
    this._SelectDateService.dateSelectedState$.next(true);
  }

  applyFilters() {
    // this._FlightsResultsService.flightObj$.next({
    //   fly_from: this.selectedDeparture$.getValue().id,
    //   fly_from_city_name: this.selectedDeparture$.getValue().city.name,
    //   fly_from_airport_name: this.selectedDeparture$.getValue().name,
    //   fly_to: this.selectedDestination$.getValue().id,
    //   fly_to_city_name: this.selectedDestination$.getValue().city.name,
    //   fly_to_airport_name: this.selectedDestination$.getValue().city.name,
    //   date_from:
    //     this.dateSelected$.getValue().fromDate.day +
    //     '/' +
    //     this.dateSelected$.getValue().fromDate.month +
    //     '/' +
    //     this.dateSelected$.getValue().fromDate.year,
    //   date_to: !this.oneWay$.getValue()
    //     ? this.dateSelected$.getValue().toDate.day +
    //       '/' +
    //       this.dateSelected$.getValue().toDate.month +
    //       '/' +
    //       this.dateSelected$.getValue().toDate.year
    //     : '',
    //   return_from: !this.oneWay$.getValue()
    //     ? this.dateSelected$.getValue().toDate.day +
    //       '/' +
    //       this.dateSelected$.getValue().toDate.month +
    //       '/' +
    //       this.dateSelected$.getValue().toDate.year
    //     : '',
    //   return_to: !this.oneWay$.getValue()
    //     ? this.dateSelected$.getValue().toDate.day +
    //       2 +
    //       '/' +
    //       this.dateSelected$.getValue().toDate.month +
    //       '/' +
    //       this.dateSelected$.getValue().toDate.year
    //     : '',
    //   nights_in_dst_from: !this.oneWay$.getValue() ? 2 : 0,
    //   nights_in_dst_to: !this.oneWay$.getValue() ? 3 : 0,
    //   adults: this.persons$.getValue().selectedAdults,
    //   children: this.persons$.getValue().selectedChildren,
    //   infants: this.persons$.getValue().selectedInfants,
    //   selected_cabins: this._BookFlightService.selectedClass$.getValue(),
    //   adult_hold_bag: this.infoSerialized$.getValue().serialized.adult.holdBags,
    //   adult_hand_bag: this.infoSerialized$.getValue().serialized.adult.handBags,
    //   child_hold_bag:
    //     this.infoSerialized$.getValue().serialized.children.holdBags ?? '0',
    //   child_hand_bag:
    //     this.infoSerialized$.getValue().serialized.children.handBags ?? '0',
    //   curr: this.defaultlanguage.defaultCurrency,
    //   locale: this.defaultlanguage.locale,
    //   flight_type: !this.oneWay$.getValue() ? 'round' : 'oneway',
    //   max_fly_duration: 20,
    //   vehicle_type: 'aircraft',
    //   limit: 500,
    // });
    this._LoaderService.loader$.next(true);
    // this._FlightsResultsService
    //   .returnFlights(this._FlightsResultsService.flightObj$.getValue())
    //   .subscribe(() => this._LoaderService.loader$.next(false));
  }
}
