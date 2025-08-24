import { Language, Languages } from 'src/app/core/types';
import {
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';

import { BehaviorSubject, Subject, of, timer } from 'rxjs';
import {
  concatMap,
  delay,
  distinctUntilChanged,
  map,
  skip,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { LoaderService } from 'src/app/core/services';

import { FlightsResultsService } from './flights-results.service';

import { SelectedDates } from '../../../shared/types';

import { FlightCardFlipService } from 'src/app/shared/services/flight-card-flip/flight-card-flip.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-flights-results',
  templateUrl: './flights-results.component.html',
  styleUrls: ['./flights-results.component.scss'],
  imports: [CommonModule],
})
export class FlightsResultsComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  toggleMenuState: string = 'closed';
  flights$ = new BehaviorSubject<any[]>([]);
  selectedDates$ = new BehaviorSubject<SelectedDates>({} as SelectedDates);
  departureBeforeAndAfterFlightsDates$ = new BehaviorSubject<any[]>([]);
  returnBeforeAfterFlightsDates$ = new BehaviorSubject<any[]>([]);
  selectedDeparture$ = new BehaviorSubject<any>('');
  selectedDestination$ = new BehaviorSubject<any>('');
  oneWay$ = new BehaviorSubject<boolean>(false);

  sidebarFilter: boolean = false;
  filterState: string = 'closed';

  route: string = 'departure';

  selectPersonsState$ = new BehaviorSubject<boolean>(false);
  personsComponentState$ = new BehaviorSubject<boolean>(true);
  departureComponentState$ = new BehaviorSubject<boolean>(true);
  destinationComponentState$ = new BehaviorSubject<boolean>(true);

  @ViewChild('header') private headerContainer!: ElementRef;

  onScrollEvnt$ = new BehaviorSubject<boolean>(false);
  overflowClass$ = new BehaviorSubject<string>('overflow-auto');
  flipCard: any[] = [];

  constructor(
    private _FlightsResultsService: FlightsResultsService,
    public _LoaderService: LoaderService,

    public _FlightCardFlipService: FlightCardFlipService,
    private zone: NgZone,
    // @Inject(DOCUMENT) private _document: any
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.flights$ = this._FlightsResultsService.flights$;
    this.selectedDates$ = this._FlightsResultsService.selectedDates$;

    // this.oneWay$ = this._SelectDateService.oneWay$;
    this.departureBeforeAndAfterFlightsDates$ =
      this._FlightsResultsService.departureBeforeAndAfterFlightsDates$;
    this.returnBeforeAfterFlightsDates$ =
      this._FlightsResultsService.returnBeforeAfterFlightsDates$;
  }

  ngOnInit(): void {
    this._FlightsResultsService.aggregateFlights();
    // this._FlightsResultsService
    //   .arrangeData()
    //   .pipe(take(1))
    //   .subscribe((data) => {
    //     console.log(data);
    //     this._LoaderService.loader$.next(false);
    //     this.arrangeDates();
    //   });

    // this._I18nService
    //   .defaultLanguageChanged$()
    //   .pipe(
    //     takeUntil(this._unsubscribeAll),
    //     skip(1),
    //     tap((data) => {
    //       // this._translate.use(data.key);
    //       // this._translate.setDefaultLang(data.key);
    //       this._LoaderService.loader$.next(true);
    //     }),
    //     switchMap(() => this._SearchFlightsService.prepareSearchFlights()),
    //     switchMap(() => this._SearchFlightsService.flightObj$.pipe(take(1))),
    //     switchMap((obj: FlightObj) => {
    //       return this._FlightsResultsService.returnFlights(obj);
    //     }),
    //     switchMap(() =>
    //       this._FlightsResultsService.arrangeData().pipe(
    //         take(1),
    //         tap(() => {
    //           this._LoaderService.loader$.next(false);
    //           this.arrangeDates();
    //         })
    //       )
    //     )
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
    //     this._StepperService.step$.next(4);
    //     this._HeaderService.showState$.next(true);
    //   });
    // }

    this.onScrollEvnt$
      .pipe(
        distinctUntilChanged(),
        tap(() => this.overflowClass$.next('overflow-hidden')),
        tap(() => {
          // setTimeout(() => {
          //   this.zone.run(() => {
          //     this.overflowClass$.next('overflow-auto');
          //   });
          // }, 280);
        })
      )
      .subscribe();
  }

  menuOpenState(state: string) {
    this.toggleMenuState = state;
  }

  changeReturnArrival(route: string) {
    this.route = route;
    this.arrangeDates();
  }

  toggleDay(day: string) {
    this.selectedDates$
      .pipe(
        take(1),
        tap((dates) => {
          if (this.route === 'departure') {
            dates.departure.day = day;
          } else {
            dates.arrival.day = day;
          }
        }),
        switchMap((dates) =>
          this._FlightsResultsService.allFlights$.pipe(
            take(1),
            map((flights) => {
              // if (this.route === 'departure') {
              //   this._FlightsResultsService.setReturnFlightsDates(
              //     flights,
              //     day,
              //     this._I18nService.defaultLanguage$.value.defaultCurrency
              //   );
              // } else {
              //   this._FlightsResultsService.setDepartureDayMinPrice(
              //     flights,
              //     dates
              //   );
              // }

              const filteredFlights = flights.filter(
                (flight: any) =>
                  flight._frvlDateConverted.departure.time.day ===
                    dates.departure.day &&
                  flight._frvlDateConverted.arrival.time.day ===
                    dates.arrival.day
              );
              console.log(filteredFlights);
              return { dates, filteredFlights };
            })
          )
        )
      )
      .subscribe(({ dates, filteredFlights }) => {
        this.selectedDates$.next(dates);
        this.flights$.next(filteredFlights);
      });
  }

  ngAfterViewInit() {
    // this._LoaderService.loader$
    //   .pipe(
    //     take(1),
    //     concatMap((item) => of(item).pipe(delay(400))),
    //     map(state =>  false)
    //   )
    //   .subscribe(state => {
    //     console.log(state)
    //   });
  }

  toggleFilterSidebar() {
    this.sidebarFilter = !this.sidebarFilter;
  }

  toggleFilters() {
    let filterState = this.filterState === 'closed' ? 'open' : 'closed';
    this._FlightsResultsService.filtersState$.next(filterState);
  }

  toggleRoute(i: number) {
    // this.flipCard[i] = !this.flipCard[i];
    // let flipSelected = this._document.querySelectorAll(
    //   '.flight-item__container'
    // );
    // let flipCardDefault =
    //   flipSelected[i].querySelector('.flight-item__container--departure')
    //     .offsetHeight + 'px';
    // let cardHeight =
    //   flipSelected[i].querySelector('.flight-item__container--arrival')
    //     .offsetHeight + 'px';
    // //this.flipCard[i] ? flipSelected[i].style.height = cardHeight : flipSelected[i].style.height = flipCardDefault;
  }

  onScroll(e: Event) {
    const target = e.target as HTMLElement;

    target.scrollTop > 200
      ? this.onScrollEvnt$.next(true)
      : this.onScrollEvnt$.next(false);

    this.arrangeDates();
  }

  arrangeDates() {
    // setTimeout(() => {
    //   const flightDates = this._document.querySelector(
    //     '.flights__before-after'
    //   );
    //   const flightDatesList = this._document.querySelector(
    //     '.departureArrival-flights ul'
    //   );
    //   const dates = [...this._document.querySelectorAll('.dates-card')];
    //   if (flightDates.classList.contains('scroll')) {
    //     dates.map((element, i) => {
    //       element.style.transform = 'translate3d(0, 0, 0)';
    //     });
    //     flightDatesList.style.width = 100 + '%';
    //   } else {
    //     dates.map((element, i) => {
    //       i === 0
    //         ? (element.style.transform = 'translate3d(, 0, 0)')
    //         : (element.style.transform =
    //             'translate3d(' + (i * 100 + i * 4) + '%, 0, 0)');
    //     });
    //     flightDatesList.style.width = dates.length * 6.8 + 'rem';
    //   }
    // }, 20);
  }

  ngOnDestroy() {
    this._unsubscribeAll.next('');
    this._unsubscribeAll.complete();
  }
}
