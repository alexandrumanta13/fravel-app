import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectDestinationComponent } from './select-destination.component';

describe('SelectDestinationComponent', () => {
  let component: SelectDestinationComponent;
  let fixture: ComponentFixture<SelectDestinationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectDestinationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectDestinationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
