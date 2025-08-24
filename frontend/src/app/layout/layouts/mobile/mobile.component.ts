import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  Inject,
  PLATFORM_ID,
  effect,
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SearchFlightsComponent } from 'src/app/modules/user/search-flights/search-flights.component';
import { SelectDateComponent } from 'src/app/modules/user/select-date/select-date.component';

import { SelectDepartureComponent } from 'src/app/modules/user/select-departure/select-departure.component';
import { SelectDestinationComponent } from 'src/app/modules/user/select-destination/select-destination.component';
import { SelectPersonsComponent } from 'src/app/modules/user/select-persons/select-persons.component';
import { SidebarComponent } from 'src/app/shared/components/sidebar/sidebar.component';
import { SharedService } from 'src/app/shared/shared.service';

@Component({
  standalone: true,
  selector: 'app-mobile-layout',
  templateUrl: './mobile.component.html',
  styleUrls: ['./mobile.component.scss'],
  imports: [
    RouterModule,
    CommonModule,
    SelectDepartureComponent,
    SelectDestinationComponent,
    SelectPersonsComponent,
    SelectDateComponent,
    SearchFlightsComponent,
    SidebarComponent,
  ],
})
export class MobileLayoutComponent implements OnInit, OnDestroy {
  toggleFilter: boolean = false;
  toggleMenu: boolean = false;
  toggleDeparture: boolean = false;
  toggleDestination: boolean = false;
  toggleSelectPersons: boolean = false;
  toggleSelectDate: boolean = false;
  toggleSearchFlight: boolean = false;

  constructor(
    private _SharedService: SharedService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        const {
          toggleFilter,
          toggleMenu,
          toggleDeparture,
          toggleDestination,
          toggleSelectPersons,
          toggleSelectDate,
          toggleSearchFlight,
        } = this._SharedService.uiState();

        this.toggleFilter = toggleFilter;
        this.toggleMenu = toggleMenu;
        this.toggleDeparture = toggleDeparture;
        this.toggleDestination = toggleDestination;
        this.toggleSelectPersons = toggleSelectPersons;
        this.toggleSelectDate = toggleSelectDate;
        this.toggleSearchFlight = toggleSearchFlight;
      });
    }
  }

  ngOnInit(): void {
    // this._I18nService
    //   .defaultLanguageChanged$()
    //   .pipe(
    //     distinctUntilChanged(),
    //     tap((lang: any) => {
    //       this.dateComponentState$.next(false);
    //     }),
    //     concatMap((item) => of(item).pipe(delay(10))) // delay to obtain animation
    //   )
    //   .subscribe(() => {
    //     this.dateComponentState$.next(true);
    //   });
    // this._BookFlightService
    //   .openSideMenu$()
    //   .pipe(takeUntil(this._unsubscribeAll))
    //   .subscribe((state) => {
    //     this.menuOpenState(state);
    //   });
    // this._GdprService
    //   .getConsent()
    //   .pipe(distinctUntilChanged())
    //   .subscribe((lang: any) => {
    //     console.log(lang);
    //     // if (isPlatformBrowser(this.platformId)) {
    //     //   timer(1000).subscribe((x) => {
    //     //     this.showGdpr.next(true);
    //     //   });
    //     // }
    //   });
    // this._BookFlightService
    //   .toggleDeparture()
    //   .pipe(distinctUntilChanged())
    //   .subscribe((state) => {
    //     this.departureComponentState$.next(state);
    //     this.departuresState$.next(state);
    //   });
    // this._BookFlightService
    //   .toggleDestination()
    //   .pipe(
    //     distinctUntilChanged(),
    //     tap((state) => {
    //       this.destinationComponentState$.next(state);
    //     }),
    //     concatMap((item) => of(item).pipe(delay(10))) // delay to obtain animation
    //   )
    //   .subscribe((state) => {
    //     this.destinationState$.next(state);
    //   });
    // this._SelectDateService
    //   .getSelectedDateState$()
    //   .pipe(
    //     distinctUntilChanged(),
    //     map((state) => {
    //       if (isPlatformBrowser(this.platformId)) {
    //         state
    //           ? timer(800).subscribe(() =>
    //               this._HeaderService.showState$.next(state)
    //             )
    //           : this._HeaderService.showState$.next(state);
    //       }
    //       return state;
    //     })
    //   )
    //   .subscribe((state) => {
    //     /* This is a hack to fix a bug. */
    //     if (state) {
    //       // setTimeout(() => {
    //       //   this._HeaderService.showState$.next(state);
    //       // }, 800);
    //     } else {
    //       this._HeaderService.showState$.next(state);
    //     }
    //     this.selectDateState$.next(state);
    //   });
    // this._SelectPersonsService
    //   .getSelectedPersonsState$()
    //   .pipe(
    //     distinctUntilChanged(),
    //     map((state) => {
    //       if (isPlatformBrowser(this.platformId)) {
    //         state
    //           ? timer(800).subscribe(() =>
    //               this._HeaderService.showState$.next(state)
    //             )
    //           : this._HeaderService.showState$.next(state);
    //       }
    //       return state;
    //     })
    //   )
    //   .subscribe((state) => {
    //     this.selectPersonsState$.next(state);
    //   });
    // this._SelectDateService
    //   .oneWayState$()
    //   .pipe(
    //     distinctUntilChanged(),
    //     tap((state) => {
    //       this.dateComponentState$.next(false);
    //     }),
    //     concatMap((item) => of(item).pipe(delay(10))) // delay to obtain animation
    //   )
    //   .subscribe((state) => {
    //     this.dateComponentState$.next(true);
    //   });
  }

  // menuOpenState(state: string) {
  //   this.toggleMenuState = state;
  // }

  ngAfterViewInit() {
    // setTimeout(() => {
    //   //  this._LoaderService.loader$.next(false);
    //   this._GdprService.checkConsent();
    //   // this.routeSubscription = this._RoutesService.currentRoute$
    //   //   .subscribe((currentRoute: CurrentRoute) => {
    //   //     this._UrlLocation.replaceState(currentRoute.url);
    //   //   });
    // }, 200);
  }

  ngOnDestroy() {}
}
