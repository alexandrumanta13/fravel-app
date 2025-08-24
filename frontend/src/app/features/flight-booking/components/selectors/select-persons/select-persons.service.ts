import { Injectable } from '@angular/core';
import { IBagsOptions, ISerializeResult } from './select-persons.type';
import { SharedService } from 'src/app/shared/shared.service';

@Injectable({
  providedIn: 'root',
})
export class SelectPersonsService {
  constructor(private _SharedService: SharedService) {}

  generateHoldBagsSerializable(
    result: ISerializeResult,
    selectedAdults: number,
    selectedChildren: number,
    holdBagsSelected: number
  ) {
    if (selectedChildren === 0) {
      result.serialized.children.holdBags = '';
    }
    const MAX_HOLDBAG_PER_PERSON = 2;
    let maxHoldBagToDistribute = holdBagsSelected - MAX_HOLDBAG_PER_PERSON;

    // theres only 3 hold bags to distribute / 1 of each
    if (maxHoldBagToDistribute === 1) {
      maxHoldBagToDistribute = holdBagsSelected;
      while (selectedAdults > 0 && holdBagsSelected > 0) {
        result.serialized.adult.holdBags += `1,`;
        selectedAdults--;
        holdBagsSelected--;
      }
      while (selectedChildren > 0 && holdBagsSelected > 0) {
        result.serialized.children.holdBags += `1,`;
        selectedChildren--;
        holdBagsSelected--;
      }
      while (selectedAdults > 0 && holdBagsSelected < 0) {
        result.serialized.adult.holdBags += `0,`;
        selectedAdults--;
      }
      while (selectedChildren > 0 && holdBagsSelected < 0) {
        result.serialized.children.holdBags += `0,`;
        selectedChildren--;
      }
    }
    // theres only 2 hold bags to distribute with a max of 1 hold bag
    else if (maxHoldBagToDistribute === 0) {
      if (selectedAdults === 1) {
        result.serialized.adult.holdBags += `2,`;
        while (holdBagsSelected > 0 && selectedChildren > 0) {
          result.serialized.children.holdBags += `0,`;
          holdBagsSelected--;
          selectedChildren--;
        }
      } else {
        while (selectedAdults > 0 && holdBagsSelected > 0) {
          result.serialized.adult.holdBags += `1,`;
          selectedAdults--;
          holdBagsSelected--;
        }
        while (selectedChildren > 0 && holdBagsSelected > 0) {
          result.serialized.children.holdBags += `1,`;
          selectedChildren--;
          holdBagsSelected--;
        }
        while (selectedAdults > 0 && holdBagsSelected <= 0) {
          result.serialized.adult.holdBags += `0,`;
          selectedAdults--;
        }
        while (selectedChildren > 0 && holdBagsSelected <= 0) {
          result.serialized.children.holdBags += `0,`;
          selectedChildren--;
        }
      }
    }
    // theres only 1 hold bag to be distributed
    else if (maxHoldBagToDistribute < 0) {
      if (holdBagsSelected === 0) {
        while (selectedAdults > 0) {
          result.serialized.adult.holdBags += `0,`;
          selectedAdults--;
        }
        while (selectedChildren > 0) {
          result.serialized.children.holdBags += `0,`;
          selectedChildren--;
        }
      } else if (holdBagsSelected === 1) {
        let hasDistributedHoldBags = false;
        if (selectedAdults > 0) {
          result.serialized.adult.holdBags += `1,`;
          selectedAdults--;
          while (selectedAdults > 0) {
            result.serialized.adult.holdBags += `0,`;
            selectedAdults--;
          }
          hasDistributedHoldBags = true;
        }
        if (selectedChildren > 0 && selectedAdults === 0) {
          if (!hasDistributedHoldBags) {
            result.serialized.children.holdBags += `1,`;
            selectedChildren--;
            while (selectedChildren > 0) {
              result.serialized.children.holdBags += `0,`;
              selectedChildren--;
            }
          } else {
            while (selectedChildren > 0) {
              result.serialized.children.holdBags += `0,`;
              selectedChildren--;
            }
          }
        }
      } else if (selectedChildren === 0) {
        while (selectedChildren > 0) {
          result.serialized.children.holdBags += `0,`;
          selectedChildren--;
        }
      } else if (selectedAdults > 0) {
        result.serialized.adult.holdBags += `1,`;
        selectedAdults--;
        while (selectedAdults > 0) {
          result.serialized.adult.holdBags += `0,`;
          selectedAdults--;
        }
        while (selectedChildren > 0) {
          result.serialized.children.holdBags += `0,`;
          selectedChildren--;
        }
      } else {
        result.serialized.children.holdBags += `1,`;
        selectedChildren--;
        while (selectedChildren > 0) {
          result.serialized.children.holdBags += `0`;
          selectedChildren--;
        }
        while (selectedAdults > 0) {
          result.serialized.adult.holdBags += `0,`;
          selectedAdults--;
        }
      }
    } else if (
      selectedAdults === holdBagsSelected ||
      selectedChildren === holdBagsSelected
    ) {
      let holdBagsAvailable = holdBagsSelected;
      if (selectedAdults === holdBagsSelected) {
        while (selectedAdults > 0) {
          result.serialized.adult.holdBags += `1,`;
          selectedAdults--;
          holdBagsAvailable--;
        }
        while (holdBagsAvailable > 0 && selectedChildren > 0) {
          result.serialized.children.holdBags += `1,`;
          selectedChildren--;
          holdBagsAvailable--;
        }
        while (selectedChildren > 0) {
          result.serialized.children.holdBags += `0,`;
          selectedChildren--;
        }
      } else {
        while (selectedChildren > 0) {
          result.serialized.children.holdBags += `1,`;
          selectedChildren--;
          holdBagsAvailable--;
        }
        while (holdBagsAvailable > 0 && selectedAdults > 0) {
          result.serialized.adult.holdBags += `1,`;
          selectedAdults--;
          holdBagsAvailable--;
        }
        while (selectedAdults > 0) {
          result.serialized.adult.holdBags += `0,`;
          selectedAdults--;
        }
      }
    } else {
      while (selectedAdults > 0 && maxHoldBagToDistribute > 1) {
        result.serialized.adult.holdBags += `${MAX_HOLDBAG_PER_PERSON},`;
        maxHoldBagToDistribute = holdBagsSelected - MAX_HOLDBAG_PER_PERSON;
        selectedAdults--;
        holdBagsSelected -= MAX_HOLDBAG_PER_PERSON;
      }

      while (selectedAdults > 0 && maxHoldBagToDistribute == 1) {
        result.serialized.adult.holdBags += `1,`;
        selectedAdults--;
        maxHoldBagToDistribute -= 1;
      }

      while (selectedAdults > 0 && maxHoldBagToDistribute < 1) {
        result.serialized.adult.holdBags += `0,`;
        maxHoldBagToDistribute = holdBagsSelected - MAX_HOLDBAG_PER_PERSON;
        holdBagsSelected -= MAX_HOLDBAG_PER_PERSON;
        selectedAdults--;
      }

      // if there is still a max hold bag to distribute available and we have finished with adults...
      // repeat entire process to children instead
      while (
        selectedAdults === 0 &&
        selectedChildren > 0 &&
        maxHoldBagToDistribute > 1
      ) {
        result.serialized.children.holdBags += `${MAX_HOLDBAG_PER_PERSON},`;
        maxHoldBagToDistribute = holdBagsSelected - MAX_HOLDBAG_PER_PERSON;
        selectedChildren--;
        holdBagsSelected -= MAX_HOLDBAG_PER_PERSON;
      }
      while (
        selectedAdults === 0 &&
        selectedChildren > 0 &&
        maxHoldBagToDistribute == 1
      ) {
        result.serialized.children.holdBags += `1,`;
        maxHoldBagToDistribute = holdBagsSelected - MAX_HOLDBAG_PER_PERSON;
        selectedChildren--;
        holdBagsSelected -= MAX_HOLDBAG_PER_PERSON;
      }
      while (
        selectedAdults === 0 &&
        selectedChildren > 0 &&
        maxHoldBagToDistribute < 1
      ) {
        result.serialized.children.holdBags += `0,`;
        maxHoldBagToDistribute = holdBagsSelected - MAX_HOLDBAG_PER_PERSON;
        selectedChildren--;
        holdBagsSelected -= MAX_HOLDBAG_PER_PERSON;
      }
    }

    result.serialized.adult.holdBags = result.serialized.adult.holdBags.slice(
      0,
      -1
    );
    result.serialized.children.holdBags =
      result.serialized.children.holdBags?.slice(0, -1);
  }

  generateHandBagsSerializable(
    result: ISerializeResult,
    selectedAdults: number,
    selectedChildren: number,
    handBagsSelected: number
  ) {
    if (selectedChildren === 0) {
      result.serialized.children.handBags = '';
    }
    const MAX_HANDBAG_PER_PERSON = 1;
    // while there's hand bags selected, distribute them among selected adults
    while (selectedAdults > 0 && handBagsSelected > 0) {
      result.serialized.adult.handBags += `${MAX_HANDBAG_PER_PERSON},`;
      selectedAdults--;
      handBagsSelected--;
    }
    // if there are leftover hand bags to be distributed, distribute them among selected childrens
    while (selectedChildren > 0 && handBagsSelected > 0) {
      result.serialized.children.handBags += `${MAX_HANDBAG_PER_PERSON},`;
      selectedChildren--;
      handBagsSelected--;
    }
    // if there are no handbags selected, just append 0 among the remaining selected adults
    while (selectedAdults > 0 && handBagsSelected == 0) {
      result.serialized.adult.handBags += `0,`;
      selectedAdults--;
    }
    // if there are no handbags selected, just append 0 among the remaining selected children
    while (selectedChildren > 0 && handBagsSelected == 0) {
      result.serialized.children.handBags += `0,`;
      selectedChildren--;
    }

    result.serialized.adult.handBags = result.serialized.adult.handBags.slice(
      0,
      -1
    );
    result.serialized.children.handBags =
      result.serialized.children.handBags?.slice(0, -1);
  }

  generateKiwiSerializedBags(options: IBagsOptions): ISerializeResult {
    let {
      selectedAdults,
      selectedChildren,
      selectedInfants,
      bags: { handBagsSelected, holdBagsSelected },
    } = options;

    let result: ISerializeResult = {
      serialized: {
        adult: {
          handBags: '',
          holdBags: '',
        },
        children: {
          handBags: '',
          holdBags: '',
        },
      },
    };

    //console.time("Generating bags execution timer")

    this.generateHandBagsSerializable(
      result,
      selectedAdults,
      selectedChildren,
      handBagsSelected
    );
    this.generateHoldBagsSerializable(
      result,
      selectedAdults,
      selectedChildren,
      holdBagsSelected
    );

    // console.timeEnd("Generating bags execution timer");

    this._SharedService.updateFlightObjFn('infoSerialized', result);

    this._SharedService.updateFlightObjFn(
      'infoSerializedOptionsPersons',
      options
    );

    this._SharedService.updateFlightObjFn(
      'infoSerializedOptionsBags',
      options.bags
    );
    return result;
  }
}
