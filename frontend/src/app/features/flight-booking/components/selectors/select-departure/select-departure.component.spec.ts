import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectDepartureComponent } from './select-departure.component';

describe('SelectDepartureComponent', () => {
  let component: SelectDepartureComponent;
  let fixture: ComponentFixture<SelectDepartureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectDepartureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectDepartureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
