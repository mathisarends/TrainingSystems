import { Component, OnInit } from '@angular/core';
import { CircularIconButtonComponent } from '../../shared/components/circular-icon-button/circular-icon-button.component';
import { HeadlineComponent } from '../../shared/components/headline/headline.component';
import { IconName } from '../../shared/icon/icon-name';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  standalone: true,
  imports: [CircularIconButtonComponent, IconComponent, HeadlineComponent],
  selector: 'app-mobile-header',
  templateUrl: 'mobile-header.component.html',
  styleUrl: 'mobile-header.component.scss',
})
export class MobileHeaderComponent implements OnInit {
  protected readonly IconName = IconName;

  constructor() {}

  ngOnInit() {}
}
