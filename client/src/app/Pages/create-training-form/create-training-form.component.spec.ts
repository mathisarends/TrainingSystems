import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTrainingFormComponent } from './create-training-form.component';

describe('CreateTrainingFormComponent', () => {
  let component: CreateTrainingFormComponent;
  let fixture: ComponentFixture<CreateTrainingFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTrainingFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateTrainingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
