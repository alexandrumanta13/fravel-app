import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ObjectUtilsService {

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }
}