import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Friend } from './friend';
import { HttpClientService } from '../../../service/http/http-client.service';
import { HttpMethods } from '../../types/httpMethods';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-friend-card',
  standalone: true,
  imports: [],
  templateUrl: './friend-card.component.html',
  styleUrl: './friend-card.component.scss',
})
export class FriendCardComponent {
  @Input() friend!: Friend;
  @Output() friendRequestSend = new EventEmitter<string>();

  constructor(private httpService: HttpClientService) {}

  async onAddFriend() {
    try {
      const response = await firstValueFrom(
        this.httpService.request<any>(
          HttpMethods.POST,
          `friendship/request/${this.friend.id}`
        )
      );

      this.friendRequestSend.emit(this.friend.id);
    } catch (error) {
      console.error(
        'Error while adding user with id ' + this.friend.id + '. ' + error
      );
    }
  }
}
