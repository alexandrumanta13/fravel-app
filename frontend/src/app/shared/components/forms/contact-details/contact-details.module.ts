import { NgModule } from '@angular/core';
import { ContactDetailsComponent } from './contact-details.component';
import { SharedModule } from 'src/app/shared/shared.module';
// import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { HttpBackend } from '@angular/common/http';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

export function createTranslateLoader(_httpBackend: HttpBackend) {
  return new MultiTranslateHttpLoader(_httpBackend, [
    './assets/i18n/errors/',
    './assets/i18n/placeholders/',
  ]);
}

@NgModule({
  declarations: [ContactDetailsComponent],
  imports: [
    SharedModule,

    // NgxIntlTelInputModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpBackend],
      },
      isolate: true,
    }),
  ],
  exports: [ContactDetailsComponent],
})
export class ContactDetailsModule {}
