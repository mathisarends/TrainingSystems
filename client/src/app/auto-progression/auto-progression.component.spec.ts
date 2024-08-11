import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoProgressionComponent } from './auto-progression.component';

describe('AutoProgressionComponent', () => {
  let component: AutoProgressionComponent;
  let fixture: ComponentFixture<AutoProgressionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoProgressionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoProgressionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
