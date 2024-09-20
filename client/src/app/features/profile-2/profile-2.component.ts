import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonClickService } from '../../shared/service/button-click.service';
import { ProfileService } from '../profile/profileService';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-profile-2',
  templateUrl: 'profile-2.component.html',
  styleUrls: ['profile-2.component.scss'],
})
export class ProfileComponent2 implements OnInit {
  constructor(
    protected profileService: ProfileService,
    private buttonClickService: ButtonClickService,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit() {
    this.buttonClickService.buttonClick$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      console.log('its a test');
    });
  }
}
