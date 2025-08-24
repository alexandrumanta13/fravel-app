import { NgModule } from '@angular/core';
import { FlightSummaryComponent } from './flight-summary.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { HttpBackend } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';

export function createTranslateLoader(_httpBackend: HttpBackend) {
  return new MultiTranslateHttpLoader(_httpBackend, [
    './assets/i18n/complete-book-flight/',
    './assets/i18n/common/',
  ]);
}

@NgModule({
  declarations: [FlightSummaryComponent],
  imports: [
    SharedModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpBackend],
      },
      isolate: true,
    }),
  ],
  exports: [FlightSummaryComponent],
})
export class FlightSummaryModule {}
