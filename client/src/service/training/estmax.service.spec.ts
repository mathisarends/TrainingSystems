import { TestBed } from '@angular/core/testing';

import { EstmaxService } from '../service/training/estmax.service';

describe('EstmaxService', () => {
  let service: EstmaxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstmaxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
