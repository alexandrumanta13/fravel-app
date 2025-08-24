import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, effect } from '@angular/core';
import { SharedService } from 'src/app/shared/shared.service';

@Component({
  standalone: true,
  selector: 'app-step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss'],
  imports: [CommonModule],
})
export class StepComponent {
  stepNumber: number = 0;
  isLast: boolean = false;
  isFirst: boolean = false;
  currentStep: number = 1;

  constructor(
    private _SharedService: SharedService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        this.currentStep = this._SharedService.currentStep();
      });
    }
  }

  // ngDoCheck() {
  //   console.log(`ngDoCheck: ${this.stepNumber}`);
  // }
}
