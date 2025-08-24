import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  BehaviorSubject,
  Subject,
  finalize,
  interval,
  startWith,
  takeUntil,
  tap,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  loader$ = new BehaviorSubject<boolean>(true);
  loadingProgress$ = new BehaviorSubject<number>(0);
  private destroy$ = new Subject<void>();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  setLoaderState(state: boolean) {
    this.loader$.next(state);
  }

  setLoaderProgress(endProgress: number, duration: number): void {
    let progress = 0;
    if (isPlatformBrowser(this.platformId)) {
      interval(10)
        .pipe(
          startWith(0),
          takeUntil(this.destroy$),
          tap(() => {
            progress += 1;
            let countedProgress = Math.round(
              progress * (endProgress / (duration / 10))
            );
            if (countedProgress < 100) {
              this.loadingProgress$.next(countedProgress);
            }
          }),
          finalize(() => {
            // Set progress to endProgress after the specified duration
            this.loadingProgress$.next(endProgress);
          })
        )
        .subscribe();
    }
  }

  // Call this method to stop the progress interval when needed
  stopLoaderProgress(): void {
    this.destroy$.next();
  }
}
