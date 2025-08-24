import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { catchError, forkJoin, Observable, of, take, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { I18nService } from '../shared/components/i18n/i18n.service';
import { RoutesService } from '../core/services';
import { SharedService } from '../shared/shared.service';

@Injectable({
  providedIn: 'root',
})
export class LayoutResolver {
  Breakpoints = Breakpoints;
  readonly clientLayouts = ['mobile', 'desktop'];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private breakpointObserver: BreakpointObserver,
    private _I18nService: I18nService,
    private _SharedService: SharedService,
    private _RoutesService: RoutesService
  ) {}

  resolve(route: ActivatedRoute): Observable<any> {
    return forkJoin({
      gdpr: this.checkConsent(),
      resolution: this.breakpointResolution(route.data),
      defaultLanguage: this.checkRouteKeyLanguage(),
    }).pipe(
      catchError((err) => {
        console.log(err);
        throw err;
      })
    );
  }

  private checkConsent(): Observable<boolean> {
    if (isPlatformBrowser(this.platformId)) {
      const consent = localStorage.getItem('_fvrl_ckie_cnst');
      return of(consent ? false : true); // Return an observable with the result
    }
    return of(false); // Return a default value if not in browser environment
  }

  /**
   * check layout based on resolution
   * if the layout is other than the client layout change
   * according to resolution otherwise take the layout from the app-routing
   * */

  private breakpointResolution(data: any) {
    if (
      this.breakpointObserver.isMatched(Breakpoints.Large) ||
      (this.breakpointObserver.isMatched(Breakpoints.XLarge) &&
        this.clientLayouts.includes(data.layout))
    ) {
      return of('desktop');
    } else if (
      this.breakpointObserver.isMatched(Breakpoints.XSmall) &&
      this.clientLayouts.includes(data.layout)
    ) {
      return of('mobile');
    }

    return of(data.layout);
  }

  private checkRouteKeyLanguage() {
    const language = this._I18nService.checkLanguage();
    this._SharedService.updateFlightObjFn('defaultLanguage', language);
    //TODO: transalte query strings if the language is changeed
    if (this._RoutesService.getLanguageKeyFromUrl() !== language.key) {
      // this._RoutesService.addTranslateQueryStrings(language.key);
    }

    return language.key;
  }
}
