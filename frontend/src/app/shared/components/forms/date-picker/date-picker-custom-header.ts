import { Component, Inject, LOCALE_ID } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MatDateFormats,
} from '@angular/material/core';
import { MatCalendar } from '@angular/material/datepicker';

@Component({
  standalone: true,
  selector: 'custom-date-picker-header',
  imports: [MatIconButton, MatIconModule],
  styleUrls: ['./date-picker.component.scss'],

  template: `
    <div class="customDatePickerHeader">
      <button mat-icon-button (click)="previousClicked()">
        <mat-icon>keyboard_arrow_left</mat-icon>
      </button>
      <span class="customDatePickerHeader-label">{{ periodLabel }}</span>
      <button mat-icon-button (click)="nextClicked()">
        <mat-icon>keyboard_arrow_right</mat-icon>
      </button>
    </div>
  `,
})
export class CustomHeader<D> {
  constructor(
    private _calendar: MatCalendar<D>,
    private _dateAdapter: DateAdapter<D>,
    @Inject(MAT_DATE_FORMATS) private _dateFormats: MatDateFormats,
    @Inject(LOCALE_ID) public localeId: string
  ) {
    this._dateAdapter.setLocale(this.localeId);
  }

  get periodLabel() {
    return this._dateAdapter
      .format(
        this._calendar.activeDate,
        this._dateFormats.display.monthYearA11yLabel
      )
      .toLocaleUpperCase();
  }

  previousClicked() {
    this._calendar.activeDate = this._dateAdapter.addCalendarMonths(
      this._calendar.activeDate,
      -1
    );
  }

  nextClicked() {
    this._calendar.activeDate = this._dateAdapter.addCalendarMonths(
      this._calendar.activeDate,
      1
    );
  }
}
