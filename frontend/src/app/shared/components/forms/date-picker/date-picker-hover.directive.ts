import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appCalendarMouseover]',
})
export class CalendarMouseoverDirective {
  @Output() dateHovered: EventEmitter<Date> = new EventEmitter<Date>();

  constructor() {
    console.log('123123213');
  }

  @HostListener('mouseenter', ['$event.target']) onMouseEnter(
    target: HTMLElement
  ) {
    const dateStr = target.getAttribute('aria-label');
    if (dateStr) {
      const date = new Date(dateStr);
      this.dateHovered.emit(date);
    }
  }
}
