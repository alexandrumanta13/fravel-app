import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassangersComponent } from './passangers.component';

describe('PassangersComponent', () => {
  let component: PassangersComponent;
  let fixture: ComponentFixture<PassangersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PassangersComponent]
    });
    fixture = TestBed.createComponent(PassangersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
