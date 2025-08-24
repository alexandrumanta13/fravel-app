import { TestBed } from '@angular/core/testing';

import { FlightsResultsService } from './flights-results.service';

describe('FlightsResultsService', () => {
  let service: FlightsResultsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlightsResultsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
