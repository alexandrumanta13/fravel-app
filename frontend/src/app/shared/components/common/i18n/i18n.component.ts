import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  effect,
} from '@angular/core';

import { Language, Languages } from '../../../core/types';

import { isPlatformBrowser } from '@angular/common';
import { I18nService } from './i18n.service';
import { SharedService } from '../../shared.service';
import { SharedModule } from '../../shared.module';
import { languages } from 'src/app/core/providers/languages';
import { RoutesService } from 'src/app/core/services';

@Component({
  standalone: true,
  selector: 'app-langauge',
  templateUrl: './i18n.component.html',
  styleUrls: ['./i18n.component.scss'],
  imports: [SharedModule],
})
export class I18nComponent {
  languages: Languages[] = languages;
  toggleLanguageMenu: boolean = false;
  selectedLanguage = {} as Language;

  constructor(
    private _SharedService: SharedService,
    private _I18nService: I18nService,
    private _RoutesService: RoutesService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        this.toggleLanguageMenu =
          this._SharedService.uiState().toggleLanguageMenu;
        this.selectedLanguage =
          this._SharedService.flightSearch().defaultLanguage;
      });
    }
  }

  setLanguage(language: Language) {
    this.toggleLanguage();
    this._I18nService.setDefaultLanguage(language);
    this._RoutesService.navigateToRoute(language.key);
  }

  toggleLanguage() {
    this._SharedService.updateUiStatesObjFn([
      { toggleLanguageMenu: !this.toggleLanguageMenu },
    ]);
  }

  changeLanguage(language: Language) {
    this.selectedLanguage = language;
  }

  changeCurrency(currency: string) {
    this.selectedLanguage.defaultCurrency = currency;
  }
}
