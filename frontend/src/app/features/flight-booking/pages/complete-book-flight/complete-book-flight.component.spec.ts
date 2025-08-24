import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteBookFlightComponent } from './complete-book-flight.component';

describe('CompleteBookFlightComponent', () => {
  let component: CompleteBookFlightComponent;
  let fixture: ComponentFixture<CompleteBookFlightComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CompleteBookFlightComponent]
    });
    fixture = TestBed.createComponent(CompleteBookFlightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
