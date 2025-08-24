import { TestBed } from '@angular/core/testing';

import { FlightsResultsStorageService } from './flights-results-storage.service';

describe('FlightsResultsStorageService', () => {
  let service: FlightsResultsStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlightsResultsStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
