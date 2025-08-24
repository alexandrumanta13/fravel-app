import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FiltersService {
  filtersState$ = new BehaviorSubject<string>('');
  constructor() { }

  toggleState$(): Observable<string> {
    return this.filtersState$.asObservable();
  }
}
