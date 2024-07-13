import { TestBed } from '@angular/core/testing';

import { CategoryPlaceholderService } from './category-placeholder.service';

describe('CategoryPlaceholderService', () => {
  let service: CategoryPlaceholderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoryPlaceholderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
