import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { DatePipe } from '@angular/common';

export interface DateFormatOptions {
  locale?: string;
  timeZone?: string;
  dateStyle?: 'short' | 'medium' | 'long' | 'full';
  timeStyle?: 'short' | 'medium' | 'long' | 'full';
  day?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'short' | 'long' | 'narrow';
  year?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
}

export interface FlightDateRange {
  departure: Date;
  return?: Date;
}

export interface DurationResult {
  hours: number;
  minutes: number;
  formatted: string;
}

@Injectable({
  providedIn: 'root',
})
export class ModernDateService {
  constructor(
    private datePipe: DatePipe,
    @Inject(LOCALE_ID) public localeId: string
  ) {}

  // ========================
  // FORMATARE MODERNE
  // ========================

  /**
   * Formatează o dată folosind Intl.DateTimeFormat modern
   */
  formatDate(
    date: Date | number | string,
    options: DateFormatOptions = {}
  ): string {
    const dateObj = this.ensureDate(date);
    const locale = options.locale || this.localeId || 'ro-RO';

    try {
      const formatter = new Intl.DateTimeFormat(locale, {
        timeZone: options.timeZone,
        dateStyle: options.dateStyle,
        timeStyle: options.timeStyle,
        day: options.day,
        month: options.month,
        year: options.year,
        hour: options.hour,
        minute: options.minute,
        second: options.second,
      });

      return formatter.format(dateObj);
    } catch (error) {
      console.warn('Formatare eșuată, folosim fallback:', error);
      return this.datePipe.transform(dateObj, 'dd/MM/yyyy') || '';
    }
  }

  /**
   * Formatări comune pentru flight booking
   */
  formatForDisplay(date: Date | number): string {
    return this.formatDate(date, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatForAPI(date: Date | number): string {
    return this.formatDate(date, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).replace(/\//g, '/'); // DD/MM/YYYY
  }

  formatTime(date: Date | number): string {
    return this.formatDate(date, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  formatDateTime(date: Date | number): string {
    const dateObj = this.ensureDate(date);
    const datePart = this.formatForDisplay(dateObj);
    const timePart = this.formatTime(dateObj);
    return `${datePart}, ${timePart}`;
  }

  // ========================
  // OPERAȚII CU DATE
  // ========================

  /**
   * Adaugă zile la o dată (immutable)
   */
  addDays(date: Date | number, days: number): Date {
    const result = new Date(this.ensureDate(date));
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Scade zile dintr-o dată (immutable)
   */
  subtractDays(date: Date | number, days: number): Date {
    return this.addDays(date, -days);
  }

  /**
   * Adaugă ore la o dată (immutable)
   */
  addHours(date: Date | number, hours: number): Date {
    const result = new Date(this.ensureDate(date));
    result.setHours(result.getHours() + hours);
    return result;
  }

  /**
   * Setează ora la începutul zilei (00:00:00.000)
   */
  startOfDay(date: Date | number): Date {
    const result = new Date(this.ensureDate(date));
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Setează ora la sfârșitul zilei (23:59:59.999)
   */
  endOfDay(date: Date | number): Date {
    const result = new Date(this.ensureDate(date));
    result.setHours(23, 59, 59, 999);
    return result;
  }

  // ========================
  // COMPARAȚII ȘI VALIDĂRI
  // ========================

  /**
   * Verifică dacă două date sunt în aceeași zi
   */
  isSameDay(date1: Date | number, date2: Date | number): boolean {
    const d1 = this.startOfDay(date1);
    const d2 = this.startOfDay(date2);
    return d1.getTime() === d2.getTime();
  }

  /**
   * Verifică dacă data este în viitor
   */
  isFuture(date: Date | number): boolean {
    return this.ensureDate(date).getTime() > Date.now();
  }

  /**
   * Verifică dacă data este în trecut
   */
  isPast(date: Date | number): boolean {
    return this.ensureDate(date).getTime() < Date.now();
  }

  /**
   * Verifică dacă data este azi
   */
  isToday(date: Date | number): boolean {
    return this.isSameDay(date, new Date());
  }

  /**
   * Verifică dacă data este mâine
   */
  isTomorrow(date: Date | number): boolean {
    const tomorrow = this.addDays(new Date(), 1);
    return this.isSameDay(date, tomorrow);
  }

  // ========================
  // CALCULĂRI DE DURATĂ
  // ========================

  /**
   * Calculează diferența în zile între două date
   */
  differenceInDays(date1: Date | number, date2: Date | number): number {
    const d1 = this.startOfDay(date1);
    const d2 = this.startOfDay(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculează diferența în ore între două date
   */
  differenceInHours(date1: Date | number, date2: Date | number): number {
    const d1 = this.ensureDate(date1);
    const d2 = this.ensureDate(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60));
  }

  /**
   * Calculează diferența în minute între două date
   */
  differenceInMinutes(date1: Date | number, date2: Date | number): number {
    const d1 = this.ensureDate(date1);
    const d2 = this.ensureDate(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.floor(diffTime / (1000 * 60));
  }

  // ========================
  // UTILITĂȚI PENTRU FLIGHT BOOKING
  // ========================

  /**
   * Convertește secunde în format ore:minute (pentru durată zbor)
   */
  convertSecondsToHourMinute(seconds: number): DurationResult {
    const totalMinutes = Math.floor(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return {
      hours,
      minutes,
      formatted: `${hours}h ${minutes.toString().padStart(2, '0')}min`,
    };
  }

  /**
   * Calculează timpul de așteptare între două zboruri
   */
  calculateLayoverTime(arrival: string | Date, departure: string | Date): DurationResult {
    const arrivalDate = this.ensureDate(arrival);
    const departureDate = this.ensureDate(departure);
    
    const diffMinutes = this.differenceInMinutes(arrivalDate, departureDate);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    let formatted = '';
    if (hours > 0) {
      formatted = `${hours}h ${minutes}min`;
    } else {
      formatted = `${minutes}min`;
    }

    return { hours, minutes, formatted };
  }

  /**
   * Generează range de date pentru calendar (de ex. pentru căutare zboruri)
   */
  generateDateRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  /**
   * Validează un range de date pentru booking
   */
  validateDateRange(departure: Date, returnDate?: Date): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const today = this.startOfDay(new Date());

    // Verifică dacă data de plecare este în viitor
    if (this.startOfDay(departure) < today) {
      errors.push('Data de plecare nu poate fi în trecut');
    }

    // Verifică returnDate dacă există
    if (returnDate) {
      if (this.startOfDay(returnDate) < this.startOfDay(departure)) {
        errors.push('Data de întoarcere nu poate fi înainte de plecare');
      }

      // Verifică dacă diferența este rezonabilă (max 1 an)
      const daysDiff = this.differenceInDays(departure, returnDate);
      if (daysDiff > 365) {
        errors.push('Călătoria nu poate depăși un an');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Obține zilele săptămânii localizate
   */
  getLocalizedDayNames(format: 'short' | 'long' | 'narrow' = 'long'): string[] {
    const days: string[] = [];
    const date = new Date(2024, 0, 1); // Luni, 1 ianuarie 2024

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(date);
      dayDate.setDate(date.getDate() + i);
      
      const dayName = this.formatDate(dayDate, {
        weekday: format as any,
      });
      days.push(dayName);
    }

    return days;
  }

  // ========================
  // UTILITĂȚI PRIVATE
  // ========================

  /**
   * Convertește input-ul într-un obiect Date valid
   */
  private ensureDate(date: Date | number | string): Date {
    if (date instanceof Date) {
      return date;
    }

    if (typeof date === 'number') {
      return new Date(date);
    }

    if (typeof date === 'string') {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) {
        throw new Error(`Data invalidă: ${date}`);
      }
      return parsed;
    }

    throw new Error(`Tip de dată nesuportat: ${typeof date}`);
  }

  // ========================
  // LEGACY COMPATIBILITY (pentru tranziție graduală)
  // ========================

  /**
   * @deprecated Folosește formatForAPI() în schimb
   */
  formatDatesForKiwiSearch(date: Date | number): string {
    console.warn('formatDatesForKiwiSearch is deprecated, use formatForAPI instead');
    return this.formatForAPI(date);
  }

  /**
   * @deprecated Folosește startOfDay() în schimb  
   */
  setHours(date: Date): number {
    console.warn('setHours is deprecated, use startOfDay instead');
    return this.startOfDay(date).getTime();
  }

  /**
   * @deprecated Folosește startOfDay() în schimb
   */
  convertDateSameHours(date: Date): Date {
    console.warn('convertDateSameHours is deprecated, use startOfDay instead');
    return this.startOfDay(date);
  }
}