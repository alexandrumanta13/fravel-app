import {
  AfterContentInit,
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  takeUntil,
  tap,
  distinctUntilChanged,
  timer,
  BehaviorSubject,
  Subject,
  concatMap,
  delay,
  of,
  switchMap,
  debounceTime,
  skip,
} from 'rxjs';
import { LoaderService } from 'src/app/core/services';

import { FlightsResultsService } from '../flights-results/flights-results.service';
import { Language, Languages } from 'src/app/core/types';
import { FlightObj } from '../search-flights/search-flights.type';
import { SelectDateService } from '../select-date/select-date.service';
import { SelectPersonsService } from '../select-persons/select-persons.service';
import { CompleteBookFlightService } from './complete-book-flight.service';
import { SearchFlightsService } from '../search-flights/search-flights.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-complete-book-flight',
  templateUrl: './complete-book-flight.component.html',
  styleUrls: ['./complete-book-flight.component.scss'],
})
export class CompleteBookFlightComponent implements OnInit, AfterViewInit {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  toggleMenuState: string = 'closed';
  flightObj$ = new BehaviorSubject<FlightObj>({} as FlightObj);
  defaultLanguage$ = new BehaviorSubject<Languages>({} as Language);
  flights$ = new BehaviorSubject<any[]>([]);
  selectedDay$ = new BehaviorSubject<any>('');
  beforeAndAfterFlights$ = new BehaviorSubject<any[]>([]);
  selectedFlight$ = new BehaviorSubject<any>([]);
  selectedDeparture$ = new BehaviorSubject<any>('');
  selectedDestination$ = new BehaviorSubject<any>('');

  sidebarFilter: boolean = false;
  filterState: string = 'closed';

  selectPersonsState$ = new BehaviorSubject<boolean>(false);
  personsComponentState$ = new BehaviorSubject<boolean>(true);
  departureComponentState$ = new BehaviorSubject<boolean>(true);
  destinationComponentState$ = new BehaviorSubject<boolean>(true);
  oneWay$ = new BehaviorSubject<boolean>(false);

  checkoutForm!: FormGroup;

  constructor(
    private _FlightsResultsService: FlightsResultsService,

    // public _translate: TranslateService,
    public _LoaderService: LoaderService,
    private _SelectDateService: SelectDateService,
    private _CompleteBookFlightService: CompleteBookFlightService,
    private _SearchFlightsService: SearchFlightsService,

    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.flightObj$ = this._SearchFlightsService.flightObj$;

    this.oneWay$ = this._SelectDateService.oneWay$;
    this.selectedFlight$ = this._FlightsResultsService.selectedFlight$;
  }
  ngOnInit(): void {
    this._LoaderService.loader$.next(true);
    // this._I18nService
    //   .defaultLanguageChanged$()
    //   .pipe(
    //     takeUntil(this._unsubscribeAll),
    //     skip(1),
    //     tap((data) => {
    //       // this._translate.use(data.key);
    //       // this._translate.setDefaultLang(data.key);
    //     })
    //   )
    //   .subscribe();

    // this._BookFlightService
    //   .openSideMenu$()
    //   .pipe(distinctUntilChanged())
    //   .subscribe((state) => {
    //     this.menuOpenState(state);
    //   });
    // if (isPlatformBrowser(this.platformId)) {
    //   timer(800).subscribe(() => {
    //     this._StepperService.step$.next(5);
    //     this._HeaderService.showState$.next(true);
    //   });
    // }

    this.createContactForm();
  }

  createContactForm(): void {
    this.checkoutForm = this.fb.group({
      name: ['', Validators.required],
      nationality: ['', Validators.required],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      email: [undefined, [Validators.required, Validators.email]],
      phoneNumber: [undefined, [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.checkoutForm.valid) {
      console.log('Form submitted successfully!');
      console.log('Form data:', this.checkoutForm.value);
    } else {
      console.error('Form has validation errors.');
    }
  }

  menuOpenState(state: string) {
    this.toggleMenuState = state;
  }

  ngAfterViewInit() {
    this._LoaderService.loader$.next(false);
    // this._HeaderService.showState$.next(true);
    // setTimeout(() => {
    //   // if (this.urlParam != 'null') {
    //   //   let splitURL = this.urlParam.split('-');
    //   //   this._BookFlightService.getAirportsByURL(splitURL[0], 'departure');
    //   //   this.selectDestination(splitURL[1]);
    //   // }
    //   this._LoaderService.loader$.next(false);
    //   this._HeaderService.showState$.next(true);
    // }, 200);
    //this._LoaderService.loader$.next(true);
  }
}
