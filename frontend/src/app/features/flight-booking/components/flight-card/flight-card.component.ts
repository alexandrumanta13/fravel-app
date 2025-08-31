import {
  Component,
  Input,
  Output,
  EventEmitter,
  PLATFORM_ID,
  inject,
  computed,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { DateUtilsFacade } from 'src/app/core/utils/date-utils.facade';

export interface FlightCardData {
  id: string;
  booking_token: string;
  price: number;
  currency: string;
  airline: string;
  airlines?: string[];
  cityFrom: string;
  cityCodeFrom: string;
  cityTo: string;
  cityCodeTo: string;
  local_departure: string;
  local_arrival: string;
  duration?: {
    total: number;
    departure: number;
    return: number;
  };
  route?: any[];
  _stops?: number;
  _isNextDay?: boolean;
  _duration?: {
    total: number;
    departure: number;
    return: number;
  };
  _airline?: {
    name: string;
    code: string;
  };
}

@Component({
  selector: 'app-flight-card',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './flight-card.component.html',
  styleUrls: ['./flight-card.component.scss']
})
export class FlightCardComponent {
  @Input({ required: true }) flight!: FlightCardData;
  @Input() selected = false;
  @Input() showCompare = true;
  @Input() showDetails = false;
  @Input() isLoading = false;

  @Output() select = new EventEmitter<FlightCardData>();
  @Output() compare = new EventEmitter<FlightCardData>();
  @Output() book = new EventEmitter<FlightCardData>();
  @Output() toggleDetails = new EventEmitter<FlightCardData>();

  private readonly platformId = inject(PLATFORM_ID);
  private readonly dateUtils = inject(DateUtilsFacade);
  private readonly translate = inject(TranslateService);

  private readonly _hovered = signal(false);

  // Computed properties
  public readonly isBrowser = computed(() => isPlatformBrowser(this.platformId));
  public readonly hovered = this._hovered.asReadonly();

  public readonly airlineName = computed(() => 
    this.flight?._airline?.name || this.flight?.airline || this.flight?.airlines?.[0] || 'Unknown Airline'
  );

  public readonly stopsCount = computed(() => 
    this.flight?._stops ?? (this.flight?.route?.length ? this.flight.route.length - 1 : 0)
  );

  public readonly departureTime = computed(() => {
    if (!this.flight?.local_departure) return '';
    return this.dateUtils.formatTime(new Date(this.flight.local_departure));
  });

  public readonly arrivalTime = computed(() => {
    if (!this.flight?.local_arrival) return '';
    return this.dateUtils.formatTime(new Date(this.flight.local_arrival));
  });

  public readonly duration = computed(() => {
    const totalMinutes = this.flight?._duration?.total || this.flight?.duration?.total || 0;
    return this.dateUtils.formatDuration(totalMinutes * 60000);
  });

  public readonly isNextDay = computed(() => {
    if (this.flight?._isNextDay !== undefined) {
      return this.flight._isNextDay;
    }
    
    if (this.flight?.local_departure && this.flight?.local_arrival) {
      const departure = new Date(this.flight.local_departure);
      const arrival = new Date(this.flight.local_arrival);
      return !this.dateUtils.isSameDay(departure, arrival);
    }
    
    return false;
  });

  public readonly formattedPrice = computed(() => {
    if (!this.flight?.price) return '';
    
    return new Intl.NumberFormat(this.translate.currentLang || 'en', {
      style: 'currency',
      currency: this.flight.currency || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(this.flight.price);
  });

  public readonly stopsText = computed(() => {
    const stops = this.stopsCount();
    
    if (stops === 0) {
      return this.translate.instant('FLIGHTS.DIRECT');
    } else if (stops === 1) {
      return this.translate.instant('FLIGHTS.ONE_STOP');
    } else {
      return this.translate.instant('FLIGHTS.STOPS', { count: stops });
    }
  });

  public readonly flightAriaLabel = computed(() => {
    return this.translate.instant('FLIGHTS.FLIGHT_ARIA_LABEL', {
      airline: this.airlineName(),
      from: this.flight?.cityFrom || '',
      to: this.flight?.cityTo || '',
      departure: this.departureTime(),
      arrival: this.arrivalTime(),
      price: this.formattedPrice(),
      stops: this.stopsText()
    });
  });

  // Event handlers
  public onFlightSelect(): void {
    if (this.isLoading) return;
    this.select.emit(this.flight);
  }

  public onCompareClick(event: Event): void {
    event.stopPropagation();
    if (this.isLoading) return;
    this.compare.emit(this.flight);
  }

  public onBookClick(event: Event): void {
    event.stopPropagation();
    if (this.isLoading) return;
    this.book.emit(this.flight);
  }

  public onToggleDetails(event: Event): void {
    event.stopPropagation();
    this.toggleDetails.emit(this.flight);
  }

  public onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onFlightSelect();
    }
  }

  public onMouseEnter(): void {
    if (this.isBrowser()) {
      this._hovered.set(true);
    }
  }

  public onMouseLeave(): void {
    if (this.isBrowser()) {
      this._hovered.set(false);
    }
  }

  // Utility methods for templates
  public getAirlineLogoUrl(): string {
    const airlineName = this.airlineName().toLowerCase().replace(/\s+/g, '-');
    return `assets/airlines/${airlineName}.png`;
  }

  public getDefaultAirlineLogoUrl(): string {
    return 'assets/airlines/default.png';
  }

  public onImageError(event: any): void {
    if (this.isBrowser()) {
      event.target.src = this.getDefaultAirlineLogoUrl();
    }
  }
}