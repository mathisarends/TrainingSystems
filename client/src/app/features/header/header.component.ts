import { Component } from '@angular/core';
import { CircularIconButtonComponent } from '../../shared/components/circular-icon-button/circular-icon-button.component';
import { HeadlineComponent } from '../../shared/components/headline/headline.component';
import { MoreOptionsButtonComponent } from '../../shared/components/more-options-button/more-options-button.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { IconName } from '../../shared/icon/icon-name';
import { ButtonClickService } from '../../shared/service/button-click.service';
import { ProfileService } from '../profile-2/service/profileService';
import { HeaderService } from './header.service';

@Component({
  standalone: true,
  imports: [CircularIconButtonComponent, HeadlineComponent, SkeletonComponent, MoreOptionsButtonComponent],
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  protected readonly IconName = IconName;

  constructor(
    protected profileService: ProfileService,
    protected headerService: HeaderService,
    private buttonClickService: ButtonClickService,
  ) {}

  // Emit the button click event
  protected onCircularButtonClick() {
    this.buttonClickService.emitButtonClick();
  }

  protected onOptionSelected(option: string) {
    this.buttonClickService.emitButtonClick(option);
  }
}
