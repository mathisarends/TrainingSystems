import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonTrainingTableComponent } from './skeleton-training-table.component';

describe('SkeletonTrainingTableComponent', () => {
  let component: SkeletonTrainingTableComponent;
  let fixture: ComponentFixture<SkeletonTrainingTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonTrainingTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkeletonTrainingTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
