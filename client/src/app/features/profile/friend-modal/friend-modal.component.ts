import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { HttpService } from '../../../core/http-client.service';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { Friend } from '../friend-card/friend';
import { FriendCardSkeletonComponent } from '../friend-card/friend-card-skeleton/friend-card-skeleton.component';
import { FriendCardComponent } from '../friend-card/friend-card.component';

@Component({
  selector: 'app-friend-modal',
  standalone: true,
  imports: [FriendCardComponent, AlertComponent, SpinnerComponent, CommonModule, FriendCardSkeletonComponent],
  templateUrl: './friend-modal.component.html',
  styleUrls: ['./friend-modal.component.scss'],
})
export class FriendModalComponent implements OnInit {
  private loadingSubject = new BehaviorSubject<boolean>(true);
  private friendsSubject = new BehaviorSubject<Friend[]>([]);
  private originalFriends: Friend[] = []; // Store the original friends list

  loading$ = this.loadingSubject.asObservable();
  friends$ = this.friendsSubject.asObservable();

  constructor(private httpService: HttpService) {}

  ngOnInit() {
    this.httpService
      .get<any>('/friendship/suggestions')
      .pipe(
        catchError((error) => {
          console.error('Error while fetching friend suggestions:', error);
          return [];
        }),
        finalize(() => this.loadingSubject.next(false)),
      )
      .subscribe((response) => {
        this.originalFriends = response.suggestions; // Store the original friends list
        this.friendsSubject.next(response.suggestions);
      });
  }

  filterFriends(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();

    if (searchTerm === '') {
      this.friendsSubject.next(this.originalFriends);
    } else {
      const updatedFriends = this.originalFriends.filter(
        (friend) => friend.name.toLowerCase().includes(searchTerm) || friend.email.toLowerCase().includes(searchTerm),
      );
      this.friendsSubject.next(updatedFriends);
    }
  }

  async onFriendRequestSend(friendId: string) {
    try {
      await firstValueFrom(this.httpService.post(`/friendship/request/${friendId}`));
    } catch (error) {
      console.error('Error while adding user with id ' + friendId + '. ' + error);
    }

    const currentFriends = this.friendsSubject.value;
    const updatedFriends = currentFriends.filter((friend) => friendId !== friend.id);
    this.friendsSubject.next(updatedFriends);
  }
}
