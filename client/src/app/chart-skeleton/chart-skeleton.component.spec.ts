import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartSkeletonComponent } from './chart-skeleton.component';

describe('ChartSkeletonComponent', () => {
  let component: ChartSkeletonComponent;
  let fixture: ComponentFixture<ChartSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartSkeletonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
