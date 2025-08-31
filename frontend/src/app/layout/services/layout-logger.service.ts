import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

@Injectable({
  providedIn: 'root'
})
export class LayoutLoggerService {
  private currentLevel: LogLevel;

  constructor() {
    // Set log level based on environment
    this.currentLevel = environment.production ? LogLevel.ERROR : LogLevel.DEBUG;
  }

  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (level <= this.currentLevel) {
      const timestamp = new Date().toISOString();
      const levelName = LogLevel[level];
      const logMessage = `[${timestamp}] [LAYOUT-${levelName}] ${message}`;

      switch (level) {
        case LogLevel.ERROR:
          console.error(logMessage, data);
          break;
        case LogLevel.WARN:
          console.warn(logMessage, data);
          break;
        case LogLevel.INFO:
          console.info(logMessage, data);
          break;
        case LogLevel.DEBUG:
          console.debug(logMessage, data);
          break;
      }
    }
  }

  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }
}