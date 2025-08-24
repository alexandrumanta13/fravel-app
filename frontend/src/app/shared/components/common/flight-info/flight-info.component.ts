import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, take } from 'rxjs';
import { SelectDateService } from 'src/app/modules/user/select-date/select-date.service';
import { FlightCardFlipService } from '../../services/flight-card-flip/flight-card-flip.service';
import { FlightsResultsService } from 'src/app/modules/user/flights-results/flights-results.service';
import { I18nService } from '../../../core/services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-flight-info',
  templateUrl: './flight-info.component.html',
  styleUrls: ['./flight-info.component.scss'],
})
export class FlightInfoComponent implements OnInit {
  @Input() flight: any;
  @Input() index!: number;

  flightIndex!: number;
  oneWay$ = new BehaviorSubject<boolean>(false);

  constructor(
    private _FlightCardFlipService: FlightCardFlipService,
    private _SelectDateService: SelectDateService,
    private _FlightsResultsService: FlightsResultsService,
    private _I18nService: I18nService,
    // public _translate: TranslateService,
    private router: Router
  ) {
    this.oneWay$ = this._SelectDateService.oneWay$;
  }

  ngOnInit(): void {
    this.flightIndex = this.index;
  }

  toggleRoute() {
    this._FlightCardFlipService.toggleRoute(this.flightIndex);
  }

  bookFlight(flight: any) {
    console.log(flight);
    this._FlightsResultsService.selectedFlight$.next(flight);
    this._I18nService.defaultLanguage$.pipe(take(1)).subscribe((lang) => {
      lang.key === 'en'
        ? this.router.navigate(['/rezerva-zbor'])
        : this.router.navigate(['/complete-book-flight']);
    });
  }
}
