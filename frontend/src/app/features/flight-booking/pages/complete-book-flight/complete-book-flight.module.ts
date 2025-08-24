import { NgModule } from '@angular/core';
import { HttpBackend } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { CompleteBookFlightComponent } from './complete-book-flight.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CompleteBookFlightRoutingModule } from './complete-book-flight.routing';
import { QuickLoginModule } from 'src/app/core/components/quick-login/quick-login.module';
import { PassangersModule } from 'src/app/shared/components/passangers/passangers.module';
import { ContactDetailsModule } from 'src/app/shared/components/contact-details/contact-details.module';
import { FlightInfoModule } from 'src/app/shared/components/flight-info/flight-info.module';
import { FlightSummaryModule } from 'src/app/shared/components/flight-summary/flight-summary.module';

export function createTranslateLoader(_httpBackend: HttpBackend) {
  //return new TranslateHttpLoader(http, './assets/i18n/book-flight/', '.json');
  return new MultiTranslateHttpLoader(_httpBackend, [
    './assets/i18n/complete-book-flight/',
    './assets/i18n/common/',
    './assets/i18n/errors/',
  ]);
}

const COMPONENTS = [CompleteBookFlightComponent];
const SHARED_MODULES = [
  SharedModule,
  CompleteBookFlightRoutingModule,
  FlightInfoModule,
  FlightSummaryModule,
  QuickLoginModule,
  PassangersModule,
  ContactDetailsModule,
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
})
export class CompleteBookFlightModule {}
