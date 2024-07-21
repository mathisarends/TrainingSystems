import { Component, Input } from '@angular/core';
import { Friend } from '../friend-card/friend';

import { FriendCardComponent } from '../friend-card/friend-card.component';
import { AlertComponent } from '../components/alert/alert.component';
import { HttpClientService } from '../../service/http-client.service';
import { HttpMethods } from '../types/httpMethods';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-friend-modal',
  standalone: true,
  imports: [FriendCardComponent, AlertComponent],
  templateUrl: './friend-modal.component.html',
  styleUrl: './friend-modal.component.scss',
})
export class FriendModalComponent {
  friends: Friend[] = [];
  filteredFriends: Friend[] = [];

  constructor(private httpService: HttpClientService) {}

  async ngOnInit() {
    const response = await firstValueFrom(
      this.httpService.request<any>(HttpMethods.GET, 'friendship/suggestions')
    );

    this.friends = response.suggestions;
    this.filteredFriends = response.suggestions;
  }

  filterFriends(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();

    this.filteredFriends = this.friends?.filter(
      (friend) =>
        friend.name.toLowerCase().includes(searchTerm) ||
        friend.email.toLowerCase().includes(searchTerm)
    );
  }
}
