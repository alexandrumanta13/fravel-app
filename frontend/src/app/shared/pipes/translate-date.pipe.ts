import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'translateDate',
})
export class TranslateDatePipe implements PipeTransform {
  constructor(
    private datePipe: DatePipe
  ) // private translateService: TranslateService
  {}
  transform(value: any, format: string = 'mediumDate'): string {
    const translatedFormat = format;
    // const translatedFormat = this.translateService.instant(format);
    console.log(
      '🚀 ~ file: translate-date.pipe.ts:16 ~ TranslateDatePipe ~ transform ~ translatedFormat:',
      translatedFormat
    );
    const date = new Date(value * 1000); // Convert timestamp to milliseconds

    if (isNaN(date.getTime())) {
      return ''; // Return empty string if the date is invalid
    }

    const formattedDate = this.datePipe.transform(date, translatedFormat);

    return formattedDate !== null ? formattedDate : ''; // Use empty string as fallback
  }
}
