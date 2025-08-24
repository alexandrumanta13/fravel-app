import { Injectable } from '@angular/core';
import { SelectPersonsService } from 'src/app/modules/user/select-persons/select-persons.service';

@Injectable({
  providedIn: 'root'
})
export class PassangersService {

  constructor(private _SelectPersonsService: SelectPersonsService) { 
    
  }

  checkInfo() {
    console.log(this._SelectPersonsService.infoSerialized$.value)
  }
}
