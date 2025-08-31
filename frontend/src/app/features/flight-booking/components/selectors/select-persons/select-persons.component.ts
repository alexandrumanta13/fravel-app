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

  // Passenger counts
  noOfAdults: number = 1;
  noOfChilds: number = 0;
  noOfInfants: number = 0;
  noOfTotalHandLuggage: number = 0;
  noOfTotalHoldLuggage: number = 0;

  // Validation constants
  private readonly MAX_TOTAL_PASSENGERS = 9;
  private readonly MIN_ADULTS = 1;
  
  // Reactive signals for UI state
  disabledAdd = signal(false);
  disabledAddAdult = signal(false);
  disabledAddChild = signal(false);
  disabledAddInfant = signal(false);
  disabledAddHandLuggage = signal(false);
  disabledAddLuggage = signal(false);
  disabledRemoveAdult = signal(false);
  disabledRemoveChild = signal(true);
  disabledRemoveInfant = signal(true);
  
  // Validation messages
  validationMessage = signal<string | null>(null);
  
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

  private validateAndUpdateState() {
    this.validatePassengerLimits();
    this.validateInfantRules();
    this.validateLuggageRules();
    this.updatePersonsState();
    this.setNumberOfPersons();
  }
  
  private validatePassengerLimits() {
    const total = this.getTotalPassengers();
    
    // Maximum 9 passengers rule
    const maxReached = total >= this.MAX_TOTAL_PASSENGERS;
    this.disabledAdd.set(maxReached);
    this.disabledAddAdult.set(maxReached);
    this.disabledAddChild.set(maxReached);
    
    // Minimum 1 adult rule
    this.disabledRemoveAdult.set(this.noOfAdults <= this.MIN_ADULTS);
    
    // Child and infant remove buttons
    this.disabledRemoveChild.set(this.noOfChilds <= 0);
    this.disabledRemoveInfant.set(this.noOfInfants <= 0);
    
    // Update validation message
    if (maxReached) {
      this.validationMessage.set('Maxim 9 pasageri sunt permiși');
    } else {
      this.validationMessage.set(null);
    }
  }
  
  private validateInfantRules() {
    // Infant cannot travel alone - must have at least one adult per infant
    const infantsExceedAdults = this.noOfInfants >= this.noOfAdults;
    
    if (infantsExceedAdults) {
      this.disabledAddInfant.set(true);
      // Auto-correct: reduce infants to match adults
      if (this.noOfInfants > this.noOfAdults) {
        this.noOfInfants = this.noOfAdults;
      }
      this.validationMessage.set('Fiecare infant trebuie însoțit de un adult');
    } else {
      const totalPassengers = this.getTotalPassengers();
      this.disabledAddInfant.set(totalPassengers >= this.MAX_TOTAL_PASSENGERS);
    }
  }
  
  private validateLuggageRules() {
    const payingPassengers = this.noOfAdults + this.noOfChilds;
    const maxHandLuggage = payingPassengers;
    const maxHoldLuggage = payingPassengers * 2;
    
    // Hand luggage validation
    if (this.noOfTotalHandLuggage >= maxHandLuggage) {
      this.disabledAddHandLuggage.set(true);
      this.noOfTotalHandLuggage = Math.min(this.noOfTotalHandLuggage, maxHandLuggage);
    } else {
      this.disabledAddHandLuggage.set(false);
    }
    
    // Hold luggage validation  
    if (this.noOfTotalHoldLuggage >= maxHoldLuggage) {
      this.disabledAddLuggage.set(true);
      this.noOfTotalHoldLuggage = Math.min(this.noOfTotalHoldLuggage, maxHoldLuggage);
    } else {
      this.disabledAddLuggage.set(false);
    }
  }
  
  private updatePersonsState() {
    this.noTotalPersons.set({
      total: this.getTotalPassengers(),
      noOfInfants: this.noOfInfants,
      noOfAdults: this.noOfAdults,
      noOfTotalHandLuggage: this.noOfTotalHandLuggage,
      noOfTotalHoldLuggage: this.noOfTotalHoldLuggage,
    });
  }
  
  private getTotalPassengers(): number {
    return this.noOfAdults + this.noOfChilds + this.noOfInfants;
  }
  
  // Backward compatibility
  calculateTotalPersons() {
    this.validateAndUpdateState();
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
    if (this.getTotalPassengers() >= this.MAX_TOTAL_PASSENGERS) {
      return;
    }
    this.noOfAdults += 1;
    this.validateAndUpdateState();
  }

  removeOneAdult() {
    if (this.noOfAdults <= this.MIN_ADULTS) {
      return;
    }
    this.noOfAdults -= 1;
    
    // Auto-adjust infants if they exceed adults
    if (this.noOfInfants > this.noOfAdults) {
      this.noOfInfants = this.noOfAdults;
    }
    
    this.validateAndUpdateState();
  }

  addOneChild() {
    if (this.getTotalPassengers() >= this.MAX_TOTAL_PASSENGERS) {
      return;
    }
    this.noOfChilds += 1;
    this.validateAndUpdateState();
  }

  removeOneChild() {
    if (this.noOfChilds <= 0) {
      return;
    }
    this.noOfChilds -= 1;
    
    // Auto-adjust luggage if it exceeds new limit
    const payingPassengers = this.noOfAdults + this.noOfChilds;
    if (this.noOfTotalHandLuggage > payingPassengers) {
      this.noOfTotalHandLuggage = payingPassengers;
    }
    if (this.noOfTotalHoldLuggage > payingPassengers * 2) {
      this.noOfTotalHoldLuggage = payingPassengers * 2;
    }
    
    this.validateAndUpdateState();
  }
  addOneInfant() {
    // Check total passenger limit
    if (this.getTotalPassengers() >= this.MAX_TOTAL_PASSENGERS) {
      return;
    }
    
    // Check infant rule: cannot exceed number of adults
    if (this.noOfInfants >= this.noOfAdults) {
      return;
    }
    
    this.noOfInfants += 1;
    this.validateAndUpdateState();
  }

  removeOneInfant() {
    if (this.noOfInfants <= 0) {
      return;
    }
    this.noOfInfants -= 1;
    this.validateAndUpdateState();
  }

  addOneHandLuggage() {
    const maxAllowed = this.noOfAdults + this.noOfChilds;
    if (this.noOfTotalHandLuggage >= maxAllowed) {
      return;
    }
    this.noOfTotalHandLuggage += 1;
    this.validateAndUpdateState();
  }

  removeOneHandLuggage() {
    if (this.noOfTotalHandLuggage <= 0) {
      return;
    }
    this.noOfTotalHandLuggage -= 1;
    this.validateAndUpdateState();
  }

  addOneLuggage() {
    const maxAllowed = (this.noOfAdults + this.noOfChilds) * 2;
    if (this.noOfTotalHoldLuggage >= maxAllowed) {
      return;
    }
    this.noOfTotalHoldLuggage += 1;
    this.validateAndUpdateState();
  }

  removeOneLuggage() {
    if (this.noOfTotalHoldLuggage <= 0) {
      return;
    }
    this.noOfTotalHoldLuggage -= 1;
    this.validateAndUpdateState();
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
