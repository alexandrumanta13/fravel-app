import { Component, Input, OnInit } from '@angular/core';
import { SelectDateService } from 'src/app/modules/user/select-date/select-date.service';
// import {
//   SearchCountryField,
//   CountryISO,
//   PhoneNumberFormat,
// } from 'ngx-intl-tel-input';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-contact-details',
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.scss'],
})
export class ContactDetailsComponent implements OnInit {
  @Input() checkoutForm!: FormGroup;
  separateDialCode: boolean = false;
  // SearchCountryField = SearchCountryField;
  // CountryISO = CountryISO;
  // PhoneNumberFormat = PhoneNumberFormat;
  // preferredCountries: CountryISO[] = [
  //   CountryISO.Romania,
  //   CountryISO.UnitedKingdom,
  // ];

  constructor(private _SelectDateService: SelectDateService) {}

  ngOnInit(): void {
    console.log(this.checkoutForm);
    console.log(this._SelectDateService.i18nDates);
  }
}
