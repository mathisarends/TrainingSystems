import { Component, Input } from '@angular/core';
import { Friend } from '../friend-card/friend';

import { FriendCardComponent } from '../friend-card/friend-card.component';
import { AlertComponent } from '../components/alert/alert.component';

@Component({
  selector: 'app-friend-modal',
  standalone: true,
  imports: [FriendCardComponent, AlertComponent],
  templateUrl: './friend-modal.component.html',
  styleUrl: './friend-modal.component.scss',
})
export class FriendModalComponent {
  @Input() friends?: Friend[];
  filteredFriends?: Friend[];

  constructor() {}

  ngOnInit() {
    if (this.friends) {
      this.filteredFriends = this.friends;
    }
  }

  filterFriends(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredFriends = this.friends?.filter(
      (friend) =>
        friend.name.toLowerCase().includes(searchTerm) ||
        friend.username.toLowerCase().includes(searchTerm)
    );
  }
}
