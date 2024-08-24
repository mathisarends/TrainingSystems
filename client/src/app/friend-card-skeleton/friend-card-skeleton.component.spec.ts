import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendCardSkeletonComponent } from './friend-card-skeleton.component';

describe('FriendCardSkeletonComponent', () => {
  let component: FriendCardSkeletonComponent;
  let fixture: ComponentFixture<FriendCardSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendCardSkeletonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FriendCardSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
