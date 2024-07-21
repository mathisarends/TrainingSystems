import { Component, Input, OnInit } from '@angular/core';
import { Friend } from '../components/friend-card/friend';

import { FriendCardComponent } from '../components/friend-card/friend-card.component';
import { SpinnerComponent } from '../components/spinner/spinner.component';
import { AlertComponent } from '../components/alert/alert.component';
import { HttpClientService } from '../../service/http/http-client.service';
import { HttpMethods } from '../types/httpMethods';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-friend-modal',
  standalone: true,
  imports: [
    FriendCardComponent,
    AlertComponent,
    SpinnerComponent,
    CommonModule,
  ],
  templateUrl: './friend-modal.component.html',
  styleUrls: ['./friend-modal.component.scss'],
})
export class FriendModalComponent implements OnInit {
  private loadingSubject = new BehaviorSubject<boolean>(true);
  private friendsSubject = new BehaviorSubject<Friend[]>([]);
  private originalFriends: Friend[] = []; // Store the original friends list

  loading$ = this.loadingSubject.asObservable();
  friends$ = this.friendsSubject.asObservable();

  constructor(private httpService: HttpClientService) {}

  ngOnInit() {
    this.httpService
      .request<any>(HttpMethods.GET, 'friendship/suggestions')
      .pipe(
        catchError((error) => {
          console.error('Error while fetching friend suggestions:', error);
          return [];
        }),
        finalize(() => this.loadingSubject.next(false))
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
        (friend) =>
          friend.name.toLowerCase().includes(searchTerm) ||
          friend.email.toLowerCase().includes(searchTerm)
      );
      this.friendsSubject.next(updatedFriends);
    }
  }

  onFriendRequestSend(userId: string) {
    const currentFriends = this.friendsSubject.value;
    const updatedFriends = currentFriends.filter(
      (friend) => userId !== friend.id
    );
    this.friendsSubject.next(updatedFriends);
  }
}
