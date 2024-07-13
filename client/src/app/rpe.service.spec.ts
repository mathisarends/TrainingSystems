import { TestBed } from '@angular/core/testing';

import { RpeService } from './rpe.service';

describe('RpeService', () => {
  let service: RpeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RpeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
