import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { I18nRoutingService } from './core/services/i18n-routing.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterOutlet, RouterModule],
})
export class AppComponent implements OnInit {
  constructor(
    private translateService: TranslateService,
    private i18nRoutingService: I18nRoutingService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.initializeLanguage();
    this.handleLanguageRedirection();
  }

  private initializeLanguage(): void {
    // Set up supported languages
    this.translateService.addLangs(['en', 'ro']);
    this.translateService.setDefaultLang('en');

    // Get language from URL or fallback to browser/default
    const langFromUrl = this.i18nRoutingService.getCurrentLanguageFromUrl();
    this.translateService.use(langFromUrl);
  }

  private handleLanguageRedirection(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Check if current URL needs language redirection
    const redirectInfo = this.i18nRoutingService.shouldRedirectForLanguage();
    if (redirectInfo.shouldRedirect && redirectInfo.redirectUrl) {
      window.location.href = redirectInfo.redirectUrl;
    }
  }
}
