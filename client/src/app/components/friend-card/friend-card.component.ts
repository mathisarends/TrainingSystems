import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Friend } from './friend';
import { FriendCardMode } from './friend-card-mode';
import { IconComponent } from '../../shared/icon/icon.component';
import { IconName } from '../../shared/icon/icon-name';

@Component({
  selector: 'app-friend-card',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './friend-card.component.html',
  styleUrls: ['./friend-card.component.scss'], // Note: styleUrls should be in plural
})
export class FriendCardComponent {
  protected IconName = IconName;

  protected readonly FriendCardMode = FriendCardMode;
  @Input() friend!: Friend;
  @Input() mode: FriendCardMode = FriendCardMode.ADD;
  @Output() confirmEvent = new EventEmitter<string>();

  onConfirm() {
    this.confirmEvent.emit(this.friend.id);
  }
}
