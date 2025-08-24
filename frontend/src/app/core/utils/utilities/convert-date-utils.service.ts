import { DatePipe } from '@angular/common';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';

import { DepartureArrivalTime, TimeParameters } from 'src/app/shared/types';
import { I18nService } from 'src/app/shared/components/i18n/i18n.service';
import {
  StringDates,
  ConvertedDatesInString,
  ComparationDates,
} from 'src/app/shared/types/dates.type';

@Injectable({
  providedIn: 'root',
})
export class ConverDateUtils {
  constructor(
    private datePipe: DatePipe,
    @Inject(LOCALE_ID) public localeId: string
  ) {
    this.datePipe = new DatePipe(this.localeId);
  }

  convertSecondsToHourMinute(seconds: number): string {
    const durationInSeconds = seconds || 0; // Ensure to handle null or undefined cases
    const durationMilliseconds = durationInSeconds * 1000; // Convert seconds to milliseconds
    const duration = new Date(durationMilliseconds);

    // format the duration into "HHh mmmin"
    const formattedDuration = this.datePipe.transform(duration, "H'h' mm'min'");

    return formattedDuration ?? ''; // Ensure to handle null or undefined cases
  }

  kiwiConvertISOTimeStringToHours(time: string): string {
    const parsedTime = new Date(time);

    // format the time into "HH:mm"
    const formattedTime = this.datePipe.transform(parsedTime, 'HH:mm');

    return formattedTime ?? '';
  }

  kiwiConvertISOTimeStringToHoursUTC(time: string): string {
    const isoDate = new Date(time);

    // Use the Date methods to extract hours and minutes
    const hours = isoDate.getUTCHours();
    const minutes = isoDate.getUTCMinutes();

    // Format hours and minutes as "HH:mm"
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;

    return formattedTime;
  }

  formatDate(date: number, format: string, locale: string): string {
    const newDate = new Date(date * 1000); // Convert from seconds to milliseconds
    return this.datePipe.transform(newDate, format, locale) || '';
  }

  getDayWithSuffix(day: number, locale: string): string {
    if (locale !== 'en-US') {
      return this.formatDate(day, 'd', locale) || '';
    }

    if (day >= 11 && day <= 13) {
      return day + 'th';
    }

    const lastDigit = day % 10;
    switch (lastDigit) {
      case 1:
        return day + 'st';
      case 2:
        return day + 'nd';
      case 3:
        return day + 'rd';
      default:
        return day + 'th';
    }
  }

  kiwiGetWaitingTime(arrival: string, nextDeparture: string) {
    // Create Date objects from the arrival and next departure times
    let arrivalDate = new Date(arrival);
    let departureDate = new Date(nextDeparture);

    // Calculate the difference in milliseconds
    let diff = departureDate.getTime() - arrivalDate.getTime();

    // Convert the difference to minutes
    let totalMinutes = Math.floor(diff / 1000 / 60);

    // Calculate hours and minutes
    let hours = Math.floor(totalMinutes / 60);
    let minutes = totalMinutes % 60;

    const waitTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    return waitTime;
  }

  kiwiFormatToDayMonth({
    unformmatedDate,
    hoursFrom,
    duration,
    hoursTo,
  }: TimeParameters): DepartureArrivalTime {
    const time = new Date(unformmatedDate);
    const formattedDate = this.datePipe.transform(time.toDateString(), 'd');
    const formattedMonth = this.datePipe.transform(time.toDateString(), 'LLL');
    const formattedYear = this.datePipe.transform(time.toDateString(), 'Y');

    return {
      day: formattedDate ?? '', // Ensure to handle null or undefined cases
      month: formattedMonth ?? '', // Ensure to handle null or undefined cases
      year: formattedYear ?? '',
      fullDate: time ?? '',
      duration: this.convertSecondsToHourMinute(duration),
      hoursDepartureFrom: hoursFrom,
      hoursDepartureTo: hoursTo,
    };
  }

  convertDateToString(dates: StringDates) {
    const convertedDate: any = {};
    for (const [key, value] of Object.entries(dates)) {
      if (key !== null && typeof key === 'string') {
        convertedDate[key] = this.formatDateAsLongDate(value);
      }
    }
    return convertedDate;
  }

  formatDateAsLongDate(date: Date) {
    const longDate = this.datePipe.transform(date, 'longDate');
    return longDate;
  }
  converDateForUrl(date: number): string {
    const urlDate = this.datePipe.transform(new Date(date), 'd-MMMM-y') || '';
    return urlDate;
  }

  convertDatesForComparation(dates: ComparationDates) {
    const convertedDate: any = {};

    for (const [key, value] of Object.entries(dates)) {
      convertedDate[key] = this.setHours(value);
    }
    return convertedDate;
  }

  formatDatesForKiwiSearch(date: number): string {
    const result =
      date !== 0 ? this.datePipe.transform(new Date(date), 'dd/MM/yyyy') : '';
    return result || '';
  }

  formatDatesForTravelFusionSearch(date: number): string {
    const result = date !== 0 ? this.datePipe.transform(new Date(date), 'dd/MM/yyyy-hh:mm') : '';
    return result || '';
  }

  setHours(date: Date): number {
    return date.setHours(0, 0, 0, 0);
  }

  convertDateSameHours(date: Date): Date {
    return new Date(this.setHours(date));
  }

  differenceInDays(date1: number, date2: number): number {
    // Convert both dates to milliseconds
    const date1MS = new Date(date1).getTime();
    const date2MS = new Date(date2).getTime();

    // Calculate the difference in milliseconds
    const differenceMS = Math.abs(date2MS - date1MS);

    // Convert the difference back to days and return
    return Math.ceil(differenceMS / (1000 * 60 * 60 * 24));
  }

  substractDays(date: number, days: number) {
    return date - days * 24 * 60 * 60 * 1000;
  }

  addDays(date: number, days: number) {
    return date + days * 24 * 60 * 60 * 1000;
  }
}
