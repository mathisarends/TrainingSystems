import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { IconName } from '../../shared/icon/icon-name';
import { IconComponent } from '../../shared/icon/icon.component';
import { ButtonClickService } from '../../shared/service/button-click.service';
import { ProfileService } from '../profile/profileService';

@Component({
  standalone: true,
  imports: [IconComponent, SpinnerComponent],
  selector: 'app-profile-2',
  templateUrl: 'profile-2.component.html',
  styleUrls: ['profile-2.component.scss'],
})
export class ProfileComponent2 implements OnInit {
  protected IconName = IconName;

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
