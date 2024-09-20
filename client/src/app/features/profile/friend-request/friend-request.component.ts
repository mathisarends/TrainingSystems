import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { HttpService } from '../../../core/http-client.service';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { Friend } from '../friend-card/friend';
import { FriendCardComponent } from '../friend-card/friend-card.component';

@Component({
  selector: 'app-friend-modal',
  standalone: true,
  imports: [FriendCardComponent, AlertComponent, SpinnerComponent, CommonModule],
  templateUrl: './friend-request.component.html',
  styleUrls: ['./friend-request.component.scss'],
})
export class FriendRequestComponent implements OnInit {
  private loadingSubject = new BehaviorSubject<boolean>(true);
  private friendsSubject = new BehaviorSubject<Friend[]>([]);
  private originalFriends: Friend[] = []; // Store the original friends list

  loading$ = this.loadingSubject.asObservable();
  friends$ = this.friendsSubject.asObservable();

  constructor(private httpService: HttpService) {}

  ngOnInit() {
    this.httpService
      .get<any>('/friendship/requests')
      .pipe(
        catchError((error) => {
          console.error('Error while fetching friend suggestions:', error);
          return [];
        }),
        finalize(() => this.loadingSubject.next(false)),
      )
      .subscribe((response) => {
        this.originalFriends = response.usersFromRequests || []; // Store the original friends list
        this.friendsSubject.next(this.originalFriends);
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

  async onFriendAccept(userId: string) {
    await firstValueFrom(this.httpService.get(`/friendship/accept/${userId}`));

    const currentFriends = this.friendsSubject.value;
    const updatedFriends = currentFriends.filter((friend) => userId !== friend.id);
    this.friendsSubject.next(updatedFriends);
  }
}
