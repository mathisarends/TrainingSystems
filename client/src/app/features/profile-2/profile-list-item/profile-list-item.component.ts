import { Component, OnInit } from '@angular/core';
import { IconName } from '../../../shared/icon/icon-name';
import { IconComponent } from '../../../shared/icon/icon.component';

@Component({
  standalone: true,
  imports: [IconComponent],
  selector: 'app-profile-list-item',
  templateUrl: './profile-list-item.component.html',
  styleUrl: './profile-list-item.component.scss',
})
export class ProfileListItemComponent implements OnInit {
  protected readonly IconName = IconName;
  constructor() {}

  ngOnInit() {}
}
