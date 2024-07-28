import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PauseTimeProgressBarComponent } from './pause-time-progress-bar.component';

describe('PauseTimeProgressBarComponent', () => {
  let component: PauseTimeProgressBarComponent;
  let fixture: ComponentFixture<PauseTimeProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PauseTimeProgressBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PauseTimeProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
