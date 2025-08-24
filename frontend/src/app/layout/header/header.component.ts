import { Component, Inject, PLATFORM_ID, effect } from '@angular/core';
import { Language } from 'src/app/core/types';
import { StepperComponent } from '../stepper/stepper.component';
import { StepComponent } from '../stepper/step/step.component';
import { SharedModule } from '../../shared.module';
import { SharedService } from '../../shared.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [StepperComponent, StepComponent, SharedModule],
})
export class HeaderComponent {
  currentStep: number = 1;
  state: string = 'closed';
  toggleLanguageMenu: boolean = false;
  toggleStepper: boolean = false;
  toggleMenu: boolean = true;
  selectedLanguage: Language = {} as Language;

  constructor(
    private _SharedService: SharedService,

    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        this.toggleMenu = this._SharedService.uiState().toggleMenu;
        this.toggleLanguageMenu =
          this._SharedService.uiState().toggleLanguageMenu;
        this.selectedLanguage =
          this._SharedService.flightSearch().defaultLanguage;
        this.currentStep = this._SharedService.currentStep();
        this.toggleStepper = this._SharedService.uiState().toggleStepper;
      });
    }
  }

  toggleMenuState() {
    this._SharedService.updateUiStatesObjFn([{ toggleMenu: !this.toggleMenu }]);
  }

  toggleLanguage() {
    this._SharedService.updateUiStatesObjFn([
      { toggleLanguageMenu: !this.toggleLanguageMenu },
    ]);
  }
}
