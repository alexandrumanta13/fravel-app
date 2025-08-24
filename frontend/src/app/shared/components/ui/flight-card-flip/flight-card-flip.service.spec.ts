import { TestBed } from '@angular/core/testing';

import { FlightCardFlipService } from './flight-card-flip.service';

describe('FlightCardFlipService', () => {
  let service: FlightCardFlipService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlightCardFlipService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
