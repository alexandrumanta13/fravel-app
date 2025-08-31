import { Pipe, PipeTransform, Inject, LOCALE_ID } from '@angular/core';
import { LocaleLayoutService } from '../services/locale-layout.service';

@Pipe({
  name: 'localeFormat',
  standalone: true
})
export class LocaleFormatPipe implements PipeTransform {
  constructor(
    private localeLayoutService: LocaleLayoutService,
    @Inject(LOCALE_ID) private localeId: string
  ) {}

  transform(
    value: number | Date | unknown, 
    type: 'currency' | 'date' | 'number' = 'number',
    options?: any
  ): string {
    if (value == null) return '';

    switch (type) {
      case 'currency':
        if (typeof value === 'number') {
          return this.localeLayoutService.formatCurrency(value, options?.currency);
        }
        break;
        
      case 'date':
        if (value instanceof Date) {
          return this.localeLayoutService.formatDate(value);
        }
        if (typeof value === 'string' || typeof value === 'number') {
          return this.localeLayoutService.formatDate(new Date(value));
        }
        break;
        
      case 'number':
        if (typeof value === 'number') {
          return this.localeLayoutService.formatNumber(value);
        }
        break;
    }

    return String(value);
  }
}

// Convenience pipes for specific formatting
@Pipe({
  name: 'localeCurrency',
  standalone: true
})
export class LocaleCurrencyPipe implements PipeTransform {
  constructor(private localeFormat: LocaleFormatPipe) {}

  transform(value: number, currency?: string): string {
    return this.localeFormat.transform(value, 'currency', { currency });
  }
}

@Pipe({
  name: 'localeDate',
  standalone: true
})
export class LocaleDatePipe implements PipeTransform {
  constructor(private localeFormat: LocaleFormatPipe) {}

  transform(value: Date | string | number): string {
    return this.localeFormat.transform(value, 'date');
  }
}

@Pipe({
  name: 'localeNumber',
  standalone: true
})
export class LocaleNumberPipe implements PipeTransform {
  constructor(private localeFormat: LocaleFormatPipe) {}

  transform(value: number): string {
    return this.localeFormat.transform(value, 'number');
  }
}