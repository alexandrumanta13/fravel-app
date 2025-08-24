import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectPersonsComponent } from './select-persons.component';

describe('SelectPersonsComponent', () => {
  let component: SelectPersonsComponent;
  let fixture: ComponentFixture<SelectPersonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectPersonsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectPersonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
