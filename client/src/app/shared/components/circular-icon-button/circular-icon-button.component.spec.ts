import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircularIconButtonComponent } from './circular-icon-button.component';

describe('CircularIconButtonComponent', () => {
  let component: CircularIconButtonComponent;
  let fixture: ComponentFixture<CircularIconButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CircularIconButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CircularIconButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
