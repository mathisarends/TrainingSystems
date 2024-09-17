import { Component, OnInit } from '@angular/core';
import { Friend } from '../../components/friend-card/friend';
import { FriendCardComponent } from '../../components/friend-card/friend-card.component';
import { SpinnerComponent } from '../../components/loaders/spinner/spinner.component';
import { AlertComponent } from '../../components/alert/alert.component';
import { HttpService } from '../../core/http-client.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { catchError, finalize } from 'rxjs/operators';
import { FriendCardSkeletonComponent } from '../../components/friend-card/friend-card-skeleton/friend-card-skeleton.component';

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
      const response = await firstValueFrom(this.httpService.post(`/friendship/request/${friendId}`));
    } catch (error) {
      console.error('Error while adding user with id ' + friendId + '. ' + error);
    }

    const currentFriends = this.friendsSubject.value;
    const updatedFriends = currentFriends.filter((friend) => friendId !== friend.id);
    this.friendsSubject.next(updatedFriends);
  }

  onSubmit(): void {
    console.log('called by service? ');
  }
}
