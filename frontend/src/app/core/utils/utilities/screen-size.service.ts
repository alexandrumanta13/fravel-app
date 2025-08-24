import { Injectable } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScreenSizeService {
  constructor(private breakpointObserver: BreakpointObserver) {}

  isMobile(): Observable<boolean> {
    return this.breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(map((result) => result.matches));
  }
}
