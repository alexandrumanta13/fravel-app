import {
  Component,
  Inject,
  LOCALE_ID,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { MatCalendar, MatDatepickerModule } from '@angular/material/datepicker';
import { SharedModule } from '../../shared.module';
import { DateAdapter } from '@angular/material/core';
import { ConverDateUtils } from 'src/app/core/utilities/convert-date-utils.service';

import { isPlatformBrowser } from '@angular/common';
import { CustomHeader } from './date-picker-custom-header';
import { SharedService } from '../../shared.service';

interface Cell {
  date: number;
  element: Element;
  change: boolean;
}

@Component({
  standalone: true,
  selector: 'app-range-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  imports: [SharedModule, MatDatepickerModule, CustomHeader],

  providers: [ConverDateUtils],
})
export class DatePickerComponent {
  customHeader = CustomHeader;
  _dateFrom!: number;
  _dateTo!: number;
  minDate: Date = new Date();

  get dateFrom() {
    return this._dateFrom ? new Date(this._dateFrom) : null;
  }
  get dateTo() {
    return this._dateTo ? new Date(this._dateTo) : null;
  }
  set dateFrom(value) {
    this._dateFrom = value ? value.getTime() : 0;
    this._SharedService.updateFlightObjFn('dateFrom', this._dateFrom);
  }
  set dateTo(value) {
    this._dateTo = value ? value.getTime() : 0;
    this._SharedService.updateFlightObjFn('dateTo', this._dateTo);
  }
  cells: Cell[] = [];
  @ViewChild(MatCalendar, { static: false }) calendar!: MatCalendar<any>;

  constructor(
    private _ConverDateUtils: ConverDateUtils,
    private _SharedService: SharedService,
    private dateAdapter: DateAdapter<Date>,
    private renderer: Renderer2,
    @Inject(LOCALE_ID) public localeId: string,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.dateFrom = this._ConverDateUtils.convertDateSameHours(new Date());
    this.dateTo = this._ConverDateUtils.convertDateSameHours(new Date());
    this.minDate = this._ConverDateUtils.convertDateSameHours(new Date());
    this.dateAdapter.setLocale(this.localeId);
  }

  // Helper method to check if a date is within a range
  private isWithinRange(
    date: number,
    startDate: number,
    endDate: number
  ): boolean {
    return date >= startDate && date <= endDate;
  }

  // Helper method to check if two dates are the same (ignoring time)
  private isSameDate(date1: number, date2: number): boolean {
    return date1 === date2;
  }

  setClass() {
    return (date: Date) => {
      if (date < this.minDate) {
        return 'disabled-date';
      }

      this.setCells();

      const dayOfMonth = this._ConverDateUtils.setHours(date);
      let classCss = '';

      if (this.isWithinRange(dayOfMonth, this._dateFrom, this._dateTo)) {
        classCss = 'inside';
        if (this.isSameDate(dayOfMonth, this._dateFrom)) {
          classCss += ' from';
        }
        if (this.isSameDate(dayOfMonth, this._dateTo)) {
          classCss += ' to';
        }
      }

      return classCss;
    };
  }

  select(date: any) {
    if (date < this.minDate) {
      return;
    }

    const dayOfMonth = this._ConverDateUtils.setHours(date);

    if (this._dateFrom > dayOfMonth || this.dateTo) {
      this.dateFrom = date;
      this.dateTo = null;
      this.redrawCells(dayOfMonth);
    } else {
      this.dateTo = date;
      this._SharedService.updateUiStatesObjFn([{ toggleSearchFlight: true }]);
    }

    this._SharedService.daysToAddFn();
  }

  setCells() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.setupCells();
      });
    }
  }

  private setupCells() {
    const elements = document.querySelectorAll('.calendar');

    if (!elements || elements.length === 0) {
      return;
    }

    const calendarCells = elements[0].querySelectorAll(
      '.mat-calendar-body-cell'
    );

    if (!this.cells) {
      this.cells = [];
    }

    calendarCells.forEach((cell) => {
      const ariaLabel = cell.getAttribute('aria-label');
      const date = ariaLabel
        ? this._ConverDateUtils.setHours(new Date(ariaLabel))
        : this._ConverDateUtils.setHours(new Date()); // Use current date if ariaLabel is null

      const existingCell = this.cells.find((c) => c.date === date);

      if (!existingCell) {
        const newCell = {
          date: date,
          element: cell,
          change: this.isWithinRange(date, this._dateFrom, this._dateTo),
        };

        this.cells.push(newCell);

        // Use Renderer2 to bind mouseenter event
        this.renderer.listen(cell, 'mouseenter', () => {
          if (!this._dateTo) {
            this.redrawCells(date);
          }
        });
      }
    });
  }

  redrawCells(timeTo: number) {
    timeTo = timeTo || this._dateTo;
    if (timeTo < this._dateFrom) {
      timeTo = this._dateFrom;
    }

    this.cells.forEach((cell) => {
      const change =
        (this._dateFrom &&
          cell.date >= this._dateFrom &&
          cell.date <= timeTo) ||
        false;
      const addInside = change ? 'inside' : '';
      const addFrom =
        cell.date === this._dateFrom ||
        (cell.date === timeTo && this._dateFrom === timeTo)
          ? 'from'
          : '';
      const addTo =
        cell.date === timeTo ||
        (cell.date === this._dateFrom && this._dateFrom === timeTo)
          ? 'to'
          : '';

      this.renderer.removeClass(cell.element, 'inside');
      this.renderer.removeClass(cell.element, 'from');
      this.renderer.removeClass(cell.element, 'to');

      if (addInside) {
        this.renderer.addClass(cell.element, 'inside');
      }
      if (addFrom) {
        this.renderer.addClass(cell.element, 'from');
      }
      if (addTo) {
        this.renderer.addClass(cell.element, 'to');
      }

      cell.change = change;
    });
  }
}
