import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreakpointObserver } from '@angular/cdk/layout';
import { PLATFORM_ID } from '@angular/core';
import { DesktopLayoutComponent } from './desktop.component';
import { SharedService } from '../../../shared/shared.service';

describe('DesktopLayoutComponent', () => {
  let component: DesktopLayoutComponent;
  let fixture: ComponentFixture<DesktopLayoutComponent>;
  let mockSharedService: jasmine.SpyObj<SharedService>;
  let mockBreakpointObserver: jasmine.SpyObj<BreakpointObserver>;

  beforeEach(async () => {
    mockSharedService = jasmine.createSpyObj('SharedService', ['updateUiStatesObjFn', 'uiState']);
    mockBreakpointObserver = jasmine.createSpyObj('BreakpointObserver', ['observe', 'isMatched']);

    await TestBed.configureTestingModule({
      imports: [DesktopLayoutComponent],
      providers: [
        { provide: SharedService, useValue: mockSharedService },
        { provide: BreakpointObserver, useValue: mockBreakpointObserver },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DesktopLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});