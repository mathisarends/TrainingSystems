import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeProfilePictureConfirmationComponent } from './change-profile-picture-confirmation.component';

describe('ChangeProfilePictureConfirmationComponent', () => {
  let component: ChangeProfilePictureConfirmationComponent;
  let fixture: ComponentFixture<ChangeProfilePictureConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeProfilePictureConfirmationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeProfilePictureConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
