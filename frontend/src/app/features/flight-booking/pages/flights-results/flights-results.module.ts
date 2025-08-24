import { NgModule } from '@angular/core';
import { FlightsResultsComponent } from './flights-results.component';
import { HttpBackend } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { FlightsResultRoutingModule } from './flights-results.routing';
import { MapComponent } from './map/map.component';
import { FiltersComponent } from 'src/app/shared/components/filters/filters.component';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { TranslateDatePipe } from 'src/app/shared/pipes/translate-date.pipe';
import { FlightInfoModule } from 'src/app/shared/components/flight-info/flight-info.module';
import { FlightSummaryModule } from 'src/app/shared/components/flight-summary/flight-summary.module';

export function createTranslateLoader(_httpBackend: HttpBackend) {
  //return new TranslateHttpLoader(http, './assets/i18n/book-flight/', '.json');
  return new MultiTranslateHttpLoader(_httpBackend, [
    './assets/i18n/flights-result/',
    './assets/i18n/common/',
  ]);
}

const COMPONENTS = [
  FlightsResultsComponent,
  MapComponent,
  FiltersComponent,
  TranslateDatePipe,
];
const SHARED_MODULES = [
  SharedModule,
  FlightsResultRoutingModule,
  FlightInfoModule,
  FlightSummaryModule,
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [
    ...SHARED_MODULES,
    TranslateModule.forChild({
      //useDefaultLang: true,
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpBackend],
      },
      isolate: true,
    }),
  ],
  providers: [],
})
export class FlightsResultsModule {}
