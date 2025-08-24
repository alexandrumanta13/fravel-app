import { TestBed } from '@angular/core/testing';

import { QuickLoginService } from './quick-login.service';

describe('QuickLoginService', () => {
  let service: QuickLoginService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuickLoginService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
