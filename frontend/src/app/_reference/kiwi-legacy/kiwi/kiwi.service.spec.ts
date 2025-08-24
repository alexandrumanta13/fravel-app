import { TestBed } from '@angular/core/testing';

import { KiwiService } from './kiwi.service';

describe('KiwiService', () => {
  let service: KiwiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KiwiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
