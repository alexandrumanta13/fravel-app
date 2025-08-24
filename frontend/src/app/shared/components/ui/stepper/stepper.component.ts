import {
  Component,
  ContentChildren,
  Inject,
  PLATFORM_ID,
  QueryList,
  effect,
} from '@angular/core';
import { take } from 'rxjs';
import { StepComponent } from './step/step.component';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { I18nService } from '../i18n/i18n.service';
import { SharedService } from '../../shared.service';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  standalone: true,
})
export class StepperComponent {
  currentStep: number = 1;
  private internalSteps!: QueryList<StepComponent>;

  constructor(
    private _I18nService: I18nService,
    private _SharedService: SharedService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        this.currentStep = this._SharedService.currentStep();

        console.log(this.currentStep);
      });

      if (this.internalSteps) {
        this.setChildSteps();
      }
    }
  }

  @ContentChildren(StepComponent)
  set stepsContent(steps: QueryList<StepComponent>) {
    if (steps.length > 0) {
      this.internalSteps = steps;
      this.internalSteps.last.isLast = true;
      this.internalSteps.first.isFirst = true;
      this.registerSteps();
    }
  }

  nextStep() {
    // this._SharedService.counter.update((val) => val++);
  }

  prevStep() {
    // this._SharedService.counter.update((val) => val--);
  }

  setStep(step: number) {
    if (step === this.currentStep) {
      return;
    }
    this._SharedService.setStepFn(step);
    // this._StepperService.step$.next(step);
    //this.counterChange.emit(step);
    // timer(280)
    //   .pipe(take(1)).subscribe(() => {
    //     this.counterChange.emit(step);
    //   })
    if (step === 1 || step === 2 || step === 3) {
      console.log('asdadadas1232121313');
      // if (this.router.url !== '/') {
      //   // this.router.navigate(['/']);
      // }
      // if (isPlatformBrowser(this.platformId)) {
      //   timer(280)
      //     .pipe(take(1))
      //     .subscribe(() => {
      //       this._SelectDateService.dateSelectedState$.next(step === 3);
      //       this._SelectPersonsService.personsSelectedState$.next(step === 2);
      //     });
      // }
    } else if (step === 4 || step === 5) {
      const isSearchResultsRoute =
        this.router.url === '/cautare/rezultate' ||
        this.router.url === '/search/results';

      const redirectToSearchResults = () => {
        // this._I18nService.defaultLanguage$.pipe(take(1)).subscribe((lang) => {
        //   lang.key === 'en'
        //     ? this.router.navigate(['/search/results'])
        //     : this.router.navigate(['/cautare/rezultate']);
        // });
      };

      if (step === 4 && !isSearchResultsRoute) {
        console.log(step === 4 && !isSearchResultsRoute);
        redirectToSearchResults();
      } else if (step === 5) {
        console.log('asdaasda');
        if (
          this.router.url === '/rezerva-zbor' ||
          this.router.url === '/complete-book-flight'
        ) {
          // Handle step 5 specific logic if needed
        } else {
          // redirectToSearchResults();
        }
      }
    }
  }

  private registerSteps(): void {
    this.internalSteps.toArray().forEach((step: StepComponent, idx: number) => {
      step.currentStep = this.currentStep;
      step.stepNumber = idx + 1;
    });
  }

  private setChildSteps(): void {
    this.internalSteps.toArray().forEach((step: StepComponent, idx: number) => {
      step.currentStep = this.currentStep;
    });
  }
}
