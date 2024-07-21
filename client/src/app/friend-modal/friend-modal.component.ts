import { Component, Input, OnInit } from '@angular/core';
import { Friend } from '../friend-card/friend';

import { FriendCardComponent } from '../friend-card/friend-card.component';
import { SpinnerComponent } from '../components/spinner/spinner.component';
import { AlertComponent } from '../components/alert/alert.component';
import { HttpClientService } from '../../service/http-client.service';
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
        this.friendsSubject.next(response.suggestions);
      });
  }

  filterFriends(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();

    this.friends$.subscribe((friends) => {
      const filteredFriends = friends.filter(
        (friend) =>
          friend.name.toLowerCase().includes(searchTerm) ||
          friend.email.toLowerCase().includes(searchTerm)
      );
      this.friendsSubject.next(filteredFriends);
    });
  }

  onFriendRequestSend(userId: string) {
    const currentFriends = this.friendsSubject.value;
    const updatedFriends = currentFriends.filter(
      (friend) => userId !== friend.id
    );
    this.friendsSubject.next(updatedFriends);
  }
}
