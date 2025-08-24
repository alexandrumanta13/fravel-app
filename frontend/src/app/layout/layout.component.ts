import {
  Component,
  Inject,
  LOCALE_ID,
  OnInit,
  PLATFORM_ID,
  effect,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Layout } from './layout.types';

import { MobileLayoutComponent } from './layouts/mobile/mobile.component';
import { DesktopLayoutComponent } from './layouts/desktop/desktop.component';
import { AdminLayoutComponent } from './layouts/admin/admin.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GdprComponent } from '../shared/components/gdpr/gdpr.component';
import { HeaderComponent } from '../shared/components/header/header.component';
import { StepperComponent } from '../shared/components/stepper/stepper.component';
import { StepComponent } from '../shared/components/stepper/step/step.component';
import { I18nComponent } from '../shared/components/i18n/i18n.component';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { SharedService } from '../shared/shared.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone: true,
  imports: [
    MobileLayoutComponent,
    DesktopLayoutComponent,
    AdminLayoutComponent,
    CommonModule,
    GdprComponent,
    LoaderComponent,
    I18nComponent,
    HeaderComponent,
    StepperComponent,
    StepComponent,
  ],
})
export class LayoutComponent implements OnInit {
  layout!: Layout;
  showGDPR: boolean = false;
  toggleLoader: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private _SharedService: SharedService,
    @Inject(LOCALE_ID) public localeId: string,
    @Inject(PLATFORM_ID) private platformId: Object //private _authService: AuthAPIService,
  ) {
    effect(() => {
      this.toggleLoader = this._SharedService.uiState().toggleLoader;
    });
  }

  ngOnInit(): void {
    const device = this.route.snapshot.data['layoutResolver'].resolution;
    this.layout = device;

    if (isPlatformBrowser(this.platformId)) {
      this.showGDPR = this.route.snapshot.data.layoutResolver.gdpr;
      this._SharedService.updateUiStatesObjFn([
        { screenWidth: window.innerWidth },
        { screenHeight: window.innerHeight },
        { isMobile: device === 'mobile' ? true : false },
      ]);
      console.log('locale', this.localeId);
    }

    //this._authService.autoLogin();
  }

  acceptGDPR() {
    this.showGDPR = false;
  }

  ngAfterViewInit() {
    this._SharedService.updateUiStatesObjFn([{ showLoader: false }]);
  }
}
