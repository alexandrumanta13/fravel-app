import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightInfoComponent } from './flight-info.component';

describe('FlightInfoComponent', () => {
  let component: FlightInfoComponent;
  let fixture: ComponentFixture<FlightInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FlightInfoComponent]
    });
    fixture = TestBed.createComponent(FlightInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
