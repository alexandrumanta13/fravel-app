import { TestBed } from '@angular/core/testing';

import { PassangersService } from './passangers.service';

describe('PassangersService', () => {
  let service: PassangersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PassangersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
