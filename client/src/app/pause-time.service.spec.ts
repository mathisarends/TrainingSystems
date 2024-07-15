import { TestBed } from '@angular/core/testing';

import { PauseTimeService } from './pause-time.service';

describe('PauseTimeService', () => {
  let service: PauseTimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PauseTimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
