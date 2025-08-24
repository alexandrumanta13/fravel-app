import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FlightCardFlipService {
  flipCard: any[] = [];
  x: boolean = false;

  constructor(@Inject(DOCUMENT) private _document: any) {}

  toggleRoute(i: number) {
    this.flipCard[i] = !this.flipCard[i];
    this.x = !this.x;
    console.log(this.flipCard[i]);
    // let flipSelected = this._document.querySelectorAll(
    //   '.flight-item__container'
    // );
    // let flipCardDefault =
    //   flipSelected[i].querySelector('.flight-item__container--departure')
    //     .offsetHeight + 'px';
    // let cardHeight =
    //   flipSelected[i].querySelector('.flight-item__container--arrival')
    //     .offsetHeight + 'px';
    //this.flipCard[i] ? flipSelected[i].style.height = cardHeight : flipSelected[i].style.height = flipCardDefault;
  }
}
