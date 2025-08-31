import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuickLoginService {
  private isQuickLoginOpenSubject = new BehaviorSubject<boolean>(false);
  public isQuickLoginOpen$ = this.isQuickLoginOpenSubject.asObservable();

  constructor() { }

  openQuickLogin(): void {
    this.isQuickLoginOpenSubject.next(true);
  }

  closeQuickLogin(): void {
    this.isQuickLoginOpenSubject.next(false);
  }

  toggleQuickLogin(): void {
    this.isQuickLoginOpenSubject.next(!this.isQuickLoginOpenSubject.value);
  }
}
