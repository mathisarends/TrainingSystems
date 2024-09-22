import { Component } from '@angular/core';
import { LoadingService } from '../../core/services/loading.service';
import { CircularIconButtonComponent } from '../../shared/components/circular-icon-button/circular-icon-button.component';
import { HeadlineComponent } from '../../shared/components/headline/headline.component';
import { HeadlineService } from '../../shared/components/headline/headline.service';
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
    protected headlineService: HeadlineService,
    protected loadingService: LoadingService,
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
