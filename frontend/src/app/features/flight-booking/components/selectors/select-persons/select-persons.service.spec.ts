import { TestBed } from '@angular/core/testing';

import { SelectPersonsService } from './select-persons.service';

describe('SelectPersonsService', () => {
  let service: SelectPersonsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectPersonsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
