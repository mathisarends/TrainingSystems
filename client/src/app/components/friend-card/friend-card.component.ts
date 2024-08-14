import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Friend } from './friend';
import { FriendCardMode } from './friend-card-mode';

@Component({
  selector: 'app-friend-card',
  standalone: true,
  imports: [],
  templateUrl: './friend-card.component.html',
  styleUrls: ['./friend-card.component.scss'], // Note: styleUrls should be in plural
})
export class FriendCardComponent {
  @Input() friend!: Friend;
  @Input() mode: FriendCardMode = FriendCardMode.ADD;
  @Output() confirmEvent = new EventEmitter<string>();

  FriendCardMode = FriendCardMode; // Expose the enum to the template

  onConfirm() {
    this.confirmEvent.emit(this.friend.id);
  }

  getIconClass(): string {
    return this.mode === FriendCardMode.ADD ? 'bx bx-user-plus' : 'bx bx-user-minus';
  }
}
