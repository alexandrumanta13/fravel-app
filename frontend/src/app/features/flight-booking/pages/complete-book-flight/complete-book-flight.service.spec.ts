import { TestBed } from '@angular/core/testing';

import { CompleteBookFlightService } from './complete-book-flight.service';

describe('CompleteBookFlightService', () => {
  let service: CompleteBookFlightService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompleteBookFlightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
