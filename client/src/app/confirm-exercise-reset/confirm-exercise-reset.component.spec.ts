import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmExerciseResetComponent } from './confirm-exercise-reset.component';

describe('ConfirmExerciseResetComponent', () => {
  let component: ConfirmExerciseResetComponent;
  let fixture: ComponentFixture<ConfirmExerciseResetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmExerciseResetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmExerciseResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
