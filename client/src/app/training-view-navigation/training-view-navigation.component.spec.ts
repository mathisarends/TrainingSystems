import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingViewNavigationComponent } from './training-view-navigation.component';

describe('TrainingViewNavigationComponent', () => {
  let component: TrainingViewNavigationComponent;
  let fixture: ComponentFixture<TrainingViewNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingViewNavigationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingViewNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
