import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, effect } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ConverDateUtils } from 'src/app/core/utilities/convert-date-utils.service';
import { CustomHeader } from 'src/app/shared/components/date-picker/date-picker-custom-header';
import { DatePickerComponent } from 'src/app/shared/components/date-picker/date-picker.component';
import { SharedService } from 'src/app/shared/shared.service';

@Component({
  standalone: true,
  selector: 'app-select-date',
  templateUrl: './select-date.component.html',
  styleUrls: ['./select-date.component.scss'],
  imports: [
    CommonModule,
    MatDatepickerModule,
    DatePickerComponent,
    CustomHeader,
  ],
  providers: [ConverDateUtils],
})
export class SelectDateComponent {
  toggleMenu: boolean = false;
  toggleFilter: boolean = false;
  isFlightTypeOneWay: boolean = false;
  toggleSearchFlight: boolean = false;
  selected!: Date | null;
  customHeader = CustomHeader;
  constructor(
    private _SharedService: SharedService,
    private _ConverDateUtils: ConverDateUtils,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        this.toggleMenu = this._SharedService.uiState().toggleMenu;
        this.toggleFilter = this._SharedService.uiState().toggleFilter;
        this.isFlightTypeOneWay =
          this._SharedService.flightSearch().isFlightTypeOneWay;
        this.toggleSearchFlight =
          this._SharedService.uiState().toggleSearchFlight;
      });
    }
  }

  onSelect(event: Date) {
    this.selected = event;

    this._SharedService.updateFlightObjFn(
      'dateFrom',
      this._ConverDateUtils.setHours(this.selected)
    );
    this._SharedService.updateUiStatesObjFn([{ toggleSearchFlight: true }]);
    this._SharedService.daysToAddFn();
  }

  toggleSelectDate() {
    this._SharedService.updateUiStatesObjFn([{ toggleSelectDate: false }]);
  }

  flightTypeChanged() {
    this._SharedService.updateFlightObjFn(
      'isFlightTypeOneWay',
      !this.isFlightTypeOneWay
    );
  }
}
