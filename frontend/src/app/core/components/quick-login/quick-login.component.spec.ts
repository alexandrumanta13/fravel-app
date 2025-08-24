import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickLoginComponent } from './quick-login.component';

describe('QuickLoginComponent', () => {
  let component: QuickLoginComponent;
  let fixture: ComponentFixture<QuickLoginComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuickLoginComponent]
    });
    fixture = TestBed.createComponent(QuickLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
