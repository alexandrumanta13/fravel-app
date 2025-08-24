import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, isDevMode } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ParamsObject } from 'src/app/shared/types/routes.type';

@Injectable({
  providedIn: 'root',
})
export class RoutesService {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  navigateToRoute(key: string) {
    if (!isDevMode() && isPlatformBrowser(this.platformId)) {
      if (window.location.host === 'localhost:4000' || 'localhost:4200') {
        window.location.href = `${window.location.protocol}//${window.location.host}/${key}/`;
      } else {
        window.location.href = window.location.hostname + `/${key}/`;
      }
    }
  }

  getLanguageKeyFromUrl() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    // Get the URL of the current page
    const url = window.location.href;

    const parts = url.split('/');
    let languageCode = '';

    // Find the language code dynamically in the URL segments
    for (let i in parts) {
      if (parts[i].length === 2 && /[a-z]{2}/.test(parts[i])) {
        // language code is always 2 characters and lowercase
        languageCode = parts[i];
        break;
      }
    }

    return languageCode;
  }

  getTranslationParams() {
    const parameters: { [key: string]: { [key: string]: string } } = {
      destination: {
        ro: 'destinatie',
        en: 'destination',
      },
      departure: {
        ro: 'plecare',
        en: 'departure',
      },
      cabinClass: {
        ro: 'clasa-de-zbor',
        en: 'cabin-class',
      },
      dateFrom: {
        ro: 'data-plecare',
        en: 'departure-date',
      },
      dateTo: {
        ro: 'data-intoarcere',
        en: 'return-date',
      },
      adults: {
        ro: 'adulti',
        en: 'adults',
      },
      infants: {
        ro: 'infanti',
        en: 'infants',
      },
      childrens: {
        ro: 'copii',
        en: 'childrens',
      },
      holdBags: {
        ro: 'bagaje-de-cala',
        en: 'hold-bags',
      },
      handBags: {
        ro: 'bagaje-de-mana',
        en: 'hand-bags',
      },
    };

    return parameters;
  }

  /**
   *
   * @param params
   * @param key
   * @returns
   *
   * Translate query parameters added on each step based on default language
   */

  translateQueryParams(params: ParamsObject, key: string) {
    const parameters = this.getTranslationParams();
    const translatedParams: ParamsObject = {};

    for (let param in params) {
      if (params.hasOwnProperty(param)) {
        const value = params[param];
        const translation = parameters[param];
        if (translation) {
          const languageKey = key;
          const translationValue = translation[languageKey];
          if (translationValue) {
            // Modify the key of params with the translation value
            translatedParams[translationValue] = value;
          } else {
            // If translation not found, keep the original key
            translatedParams[param] = value;
          }
        }
      }
    }

    return translatedParams;
  }

  // translateKeys(objectToTranslate: ParamsObject, language: string) {
  //   const translationParams = this.getTranslationParams();
  //   const translatedObject: ParamsObject = {};

  //   for (const key in objectToTranslate) {
  //     if (objectToTranslate.hasOwnProperty(key)) {
  //       if (translationParams[key]) {
  //         const translatedKey = translationParams[key][language]; // Use the language parameter
  //         translatedObject[translatedKey] = objectToTranslate[key];
  //       } else {
  //         translatedObject[key] = objectToTranslate[key];
  //       }
  //     }
  //   }

  //   return translatedObject;
  // }

  addQueryParamsWithoutReload(params: ParamsObject, languageKey: string) {
    if (isPlatformBrowser(this.platformId)) {
      const dynamicQueryParams = this.translateQueryParams(params, languageKey);
      // Merge the current query parameters with the dynamic ones
      const mergedParams = {
        ...this.route.snapshot.queryParams,
        ...dynamicQueryParams,
      };

      // Navigate without reloading the page
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: mergedParams,
        queryParamsHandling: 'merge',
      });
    }
  }

  // checkForQueryStringsFn() {
  //   const url = this.router.url;
  //   const objQueryStrings: ParamsObject = {};
  //   const queryStringIndex = url.indexOf('?');

  //   if (queryStringIndex !== -1) {
  //     const urlQueryString = url.substring(queryStringIndex + 1);
  //     const urlSplitted = urlQueryString.split('&');

  //     urlSplitted.forEach((item) => {
  //       const [key, value] = item.split('=');
  //       objQueryStrings[key] = decodeURIComponent(value);
  //     });

  //     return objQueryStrings;
  //   }

  //   return {};
  // }

  // addTranslateQueryStrings(key: string) {
  //   setTimeout(() => {
  //     const checkForQueryStrings = this.checkForQueryStringsFn();
  //     let queryString = {};
  //     this.removeQueryStrings();

  //     console.log(
  //       '🚀 ~ RoutesService ~ setTimeout ~ checkForQueryStrings:',
  //       checkForQueryStrings
  //     );
  //     // if (Object.keys(checkForQueryStrings).length > 0) {
  //     //   queryString = Object.keys(this.translateKeys(checkForQueryStrings, key))
  //     //     .map(
  //     //       (key) =>
  //     //         `${encodeURIComponent(key)}=${encodeURIComponent(
  //     //           checkForQueryStrings[key]
  //     //         )}`
  //     //     )
  //     //     .join('&');
  //     // }

  //     this.addQueryParamsWithoutReload(checkForQueryStrings, key);

  //     console.log(queryString);
  //   }, 200);
  // }

  removeQueryStrings() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
  }
}
