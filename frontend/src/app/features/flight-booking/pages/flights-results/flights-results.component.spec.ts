import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightsResultsComponent } from './flights-results.component';

describe('FlightsResultsComponent', () => {
  let component: FlightsResultsComponent;
  let fixture: ComponentFixture<FlightsResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlightsResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightsResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
