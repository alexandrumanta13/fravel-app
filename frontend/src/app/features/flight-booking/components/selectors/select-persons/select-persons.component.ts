import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  PLATFORM_ID,
  ViewChild,
  effect,
  signal,
} from '@angular/core';
import { SelectPersonsService } from './select-persons.service';
import {
  BagsQueryType,
  BagsType,
  IBagsOptions,
  Persons,
} from './select-persons.type';
import { SharedService } from 'src/app/shared/shared.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  standalone: true,
  selector: 'app-select-persons',
  templateUrl: './select-persons.component.html',
  styleUrls: ['./select-persons.component.scss'],
  imports: [SharedModule],
})
export class SelectPersonsComponent {
  @ViewChild('scrollTop') private myScrollContainer!: ElementRef;

  classType: boolean = true;

  noOfAdults: number = 1;
  noOfChilds: number = 0;
  noOfInfants: number = 0;
  noOfTotalHandLuggage: number = 0;
  noOfTotalHoldLuggage: number = 0;

  disabledAdd = signal(false);
  disabledAddHandLuggage = signal(false);
  disabledAddLuggage = signal(false);
  disabledAddInfant = signal(false);
  noTotalPersons = signal({} as Persons);

  toggleMenu: boolean = false;
  toggleFilter: boolean = false;

  constructor(
    private _SelectPersonsService: SelectPersonsService,
    private _SharedService: SharedService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        this.toggleMenu = this._SharedService.uiState().toggleMenu;
        this.toggleFilter = this._SharedService.uiState().toggleFilter;
      });
    }

    this._SharedService.updateFlightObjFn('infoSerialized', {
      serialized: {
        adult: {
          handBags: '0',
          holdBags: '0',
        },
        children: {
          handBags: undefined,
          holdBags: undefined,
        },
      },
    });

    this._SharedService.updateFlightObjFn('infoSerializedOptionsPersons', {
      selectedAdults: 1,
      selectedChildren: 0,
      selectedInfants: 0,
      bags: {
        handBagsSelected: 0,
        holdBagsSelected: 0,
      },
    });

    this._SharedService.updateFlightObjFn('infoSerializedOptionsBags', {
      handBagsSelected: 0,
      holdBagsSelected: 0,
    });
  }

  calculateTotalPersons() {
    const total = this.noOfAdults + this.noOfChilds + this.noOfInfants;
    total >= 9 ? this.disabledAdd.set(true) : this.disabledAdd.set(false);

    if (this.noOfInfants >= this.noOfAdults) {
      this.disabledAddInfant.set(true);
      this.noOfInfants = this.noOfAdults;
    } else {
      this.disabledAddInfant.set(false);
    }

    if (this.noOfTotalHandLuggage >= this.noOfAdults + this.noOfChilds) {
      this.disabledAddHandLuggage.set(true);
      this.noOfTotalHandLuggage = this.noOfAdults + this.noOfChilds;
    } else {
      this.disabledAddHandLuggage.set(false);
    }

    if (this.noOfTotalHoldLuggage >= (this.noOfAdults + this.noOfChilds) * 2) {
      this.disabledAddLuggage.set(true);
      this.noOfTotalHoldLuggage = (this.noOfAdults + this.noOfChilds) * 2;
    } else {
      this.disabledAddLuggage.set(false);
    }
    this.noTotalPersons.set({
      total: this.noOfAdults + this.noOfChilds + this.noOfInfants,
      noOfInfants: this.noOfInfants,
      noOfAdults: this.noOfAdults,
      noOfTotalHandLuggage: this.noOfTotalHandLuggage,
      noOfTotalHoldLuggage: this.noOfTotalHoldLuggage,
    });

    this.setNumberOfPersons();
  }

  setNumberOfPersons() {
    const bagOptionsQuery: IBagsOptions = {
      selectedAdults: this.noOfAdults,
      selectedChildren: this.noOfChilds,
      selectedInfants: this.noOfInfants,
      bags: {
        handBagsSelected: this.noTotalPersons().noOfTotalHandLuggage ?? 0,
        holdBagsSelected: this.noTotalPersons().noOfTotalHoldLuggage ?? 0,
      },
    };

    this._SelectPersonsService.generateKiwiSerializedBags(bagOptionsQuery);
  }

  addOneAdult() {
    this.noOfAdults += 1;
    this.calculateTotalPersons();
  }

  removeOneAdult() {
    if (this.noOfAdults === 1) {
      return;
    }
    this.noOfAdults -= 1;
    this.calculateTotalPersons();
  }

  addOneChild() {
    this.noOfChilds += 1;
    this.calculateTotalPersons();
  }

  removeOneChild() {
    if (this.noOfChilds === 0) {
      return;
    }
    this.noOfChilds -= 1;
    this.calculateTotalPersons();
  }
  addOneInfant() {
    this.noOfInfants += 1;
    this.calculateTotalPersons();
  }

  removeOneInfant() {
    if (this.noOfInfants === 0) {
      return;
    }
    this.noOfInfants -= 1;
    this.calculateTotalPersons();
  }

  addOneHandLuggage() {
    this.noOfTotalHandLuggage += 1;
    this.calculateTotalPersons();
  }

  removeOneHandLuggage() {
    if (this.noOfTotalHandLuggage === 0) {
      return;
    }
    this.noOfTotalHandLuggage -= 1;
    this.calculateTotalPersons();
  }

  addOneLuggage() {
    this.noOfTotalHoldLuggage += 1;
    this.calculateTotalPersons();
  }

  removeOneLuggage() {
    if (this.noOfTotalHoldLuggage === 0) {
      return;
    }
    this.noOfTotalHoldLuggage -= 1;
    this.calculateTotalPersons();
  }

  toggleSelectPersons() {
    this._SharedService.updateUiStatesObjFn([{ toggleSelectPersons: true }]);
  }

  selectDate() {
    this._SharedService.setStepFn(3);
    // this._StepperService.step$.next(3);
    // this._SelectPersonsService.personsSelectedState$.next(false);
    // setTimeout(() => {
    //   this.scrollToTop();
    // }, 500);
  }

  scrollToTop() {
    try {
      this.myScrollContainer.nativeElement.scrollTop = 0;
    } catch (err) {}
  }
}
