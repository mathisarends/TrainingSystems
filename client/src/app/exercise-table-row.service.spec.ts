import { TestBed } from '@angular/core/testing';

import { ExerciseTableRowService } from './exercise-table-row.service';

describe('ExerciseTableRowService', () => {
  let service: ExerciseTableRowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExerciseTableRowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
