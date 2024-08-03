import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { catchError, finalize } from 'rxjs/operators';
import { FriendCardComponent } from '../components/friend-card/friend-card.component';
import { AlertComponent } from '../components/alert/alert.component';
import { SpinnerComponent } from '../components/spinner/spinner.component';
import { Friend } from '../components/friend-card/friend';
import { HttpClientService } from '../../service/http/http-client.service';
import { HttpMethods } from '../types/httpMethods';

@Component({
  selector: 'app-friend-modal',
  standalone: true,
  imports: [
    FriendCardComponent,
    AlertComponent,
    SpinnerComponent,
    CommonModule,
  ],
  templateUrl: './friend-request.component.html',
  styleUrls: ['./friend-request.component.scss'],
})
export class FriendRequestComponent implements OnInit {
  private loadingSubject = new BehaviorSubject<boolean>(true);
  private friendsSubject = new BehaviorSubject<Friend[]>([]);
  private originalFriends: Friend[] = []; // Store the original friends list

  loading$ = this.loadingSubject.asObservable();
  friends$ = this.friendsSubject.asObservable();

  constructor(private httpService: HttpClientService) {}

  ngOnInit() {
    this.httpService
      .request<any>(HttpMethods.GET, 'friendship/requests')
      .pipe(
        catchError((error) => {
          console.error('Error while fetching friend suggestions:', error);
          return [];
        }),
        finalize(() => this.loadingSubject.next(false))
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
        (friend) =>
          friend.name.toLowerCase().includes(searchTerm) ||
          friend.email.toLowerCase().includes(searchTerm)
      );
      this.friendsSubject.next(updatedFriends);
    }
  }

  async onFriendAccept(userId: string) {
    const response = await firstValueFrom(
      this.httpService.request<any>(
        HttpMethods.POST,
        `friendship/accept/${userId}`
      )
    );
    console.log(
      '🚀 ~ FriendRequestComponent ~ onFriendAccept ~ response:',
      response
    );

    const currentFriends = this.friendsSubject.value;
    const updatedFriends = currentFriends.filter(
      (friend) => userId !== friend.id
    );
    this.friendsSubject.next(updatedFriends);
  }
}