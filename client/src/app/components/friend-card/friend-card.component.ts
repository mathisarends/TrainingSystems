import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Friend } from './friend';

@Component({
  selector: 'app-friend-card',
  standalone: true,
  imports: [],
  templateUrl: './friend-card.component.html',
  styleUrl: './friend-card.component.scss',
})
export class FriendCardComponent {
  @Input() friend!: Friend;
  @Output() confirmEvent = new EventEmitter<string>(); // z.B. Friend requests absenden, akzeptieren

  onConfirm() {
    // emit so parent component can handle
    this.confirmEvent.emit(this.friend.id);
  }
}
