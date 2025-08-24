import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ConverDateUtils } from '../core/utilities/convert-date-utils.service';

// export function createTranslateLoader(_httpBackend: HttpBackend) {
//   //return new TranslateHttpLoader(http, './assets/i18n/book-flight/', '.json');
//   return new MultiTranslateHttpLoader(_httpBackend, [
//     './assets/i18n/book-flight/',
//     './assets/i18n/common/',
//   ])
// }

const COMPONENTS = [];
const SHARED_MODULES = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  HttpClientModule,
];

@NgModule({
  declarations: [],
  imports: [...SHARED_MODULES],
  exports: [...SHARED_MODULES],
  providers: [DatePipe],
})
export class SharedModule {}
