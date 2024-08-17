import { Component, OnInit, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { ProfileService } from './profileService';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { User } from '../../types/user';
import { ImageUploadService } from '../../../service/util/image-upload.service';
import { ModalService } from '../../../service/modal/modalService';
import { ChangeProfilePictureConfirmationComponent } from '../../change-profile-picture-confirmation/change-profile-picture-confirmation.component';
import { ModalSize } from '../../../service/modal/modalSize';
import { ModalEventsService } from '../../../service/modal/modal-events.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { HttpService } from '../../../service/http/http-client.service';
import { HttpMethods } from '../../types/httpMethods';
import { FriendCardComponent } from '../../components/friend-card/friend-card.component';
import { TooltipDirective } from '../../../service/tooltip/tooltip.directive';
import { Friend } from '../../components/friend-card/friend';
import { AlertComponent } from '../../components/alert/alert.component';
import { FriendRequestComponent } from '../../friend-request/friend-request.component';
import { FriendCardMode } from '../../components/friend-card/friend-card-mode';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  standalone: true,
  imports: [SpinnerComponent, FriendCardComponent, TooltipDirective, AlertComponent, PaginationComponent],
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profile!: User;
  isLoading = true;

  @ViewChild('profileImage', { static: false })
  profileImageElement!: ElementRef;

  @ViewChild('fileInput', { static: false }) fileInputElement!: ElementRef;

  private subscription: Subscription = new Subscription();

  filteredFriends: Friend[] = [];
  friends: Friend[] = [];

  existingFriendCardMode = FriendCardMode.REMOVE;
  pendingFriendCardMode = FriendCardMode.ADD;

  constructor(
    private profileService: ProfileService,
    private imageUploadService: ImageUploadService,
    private renderer: Renderer2,
    private modalService: ModalService,
    private modalEventsService: ModalEventsService,
    private httpService: HttpService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.profile = data?.userDto;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Fehler beim Abrufen des Profils', err);
      },
      complete: () => {
        console.log('Profil erfolgreich geladen');
      },
    });

    this.subscription.add(this.modalEventsService.confirmClick$.subscribe(() => this.uploadProfilePicture()));

    this.subscription.add(this.modalEventsService.abortClick$.subscribe(() => this.restoreOriginalProfilePicture()));

    const response = await firstValueFrom(this.httpService.get<any>('/friendship'));

    this.friends = response.friends;
    this.filteredFriends = this.friends; // hier bitte einmal kombinieren
  }

  restoreOriginalProfilePicture() {
    this.renderer.setAttribute(
      this.profileImageElement.nativeElement,
      'src',
      this.profile.pictureUrl ?? '/images/profile-placeholder.webp',
    );
  }

  uploadProfilePicture() {
    const currentProfileImageUrl = this.profileImageElement.nativeElement.src;

    this.httpService
      .post<any>('/user/update-profile-picture', {
        profilePicture: currentProfileImageUrl,
      })
      .subscribe({
        next: () => {
          this.modalService.close();
        },
        error: (x) => {
          this.modalService.close();
        },
      });
  }

  triggerFileInput() {
    this.fileInputElement.nativeElement.click();
  }

  handleImageUpload(event: Event) {
    this.imageUploadService.handleImageUpload(
      event,
      (result: string) => {
        this.renderer.setAttribute(this.profileImageElement.nativeElement, 'src', result);

        this.showProfilePictureChangeDialog(result);
      },
      true,
    );
  }

  showProfilePictureChangeDialog(newProfilePicture: string) {
    this.modalService.open({
      component: ChangeProfilePictureConfirmationComponent,
      title: 'Profilbild ändern',
      buttonText: 'Bestäigen',
      size: ModalSize.LARGE,
      componentData: {
        oldProfilePicture: this.profile.pictureUrl,
        newProfilePicture: newProfilePicture,
      },
    });
  }

  filterFriends(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredFriends = this.friends.filter(
      (friend) => friend.name.toLowerCase().includes(searchTerm) || friend.email.toLowerCase().includes(searchTerm),
    );
  }

  openFriendRequestsModal() {
    this.modalService.open({
      component: FriendRequestComponent,
      title: 'Freundesanfragen',
      buttonText: 'Fertig',
      size: ModalSize.LARGE,
    });
  }

  openAddFriendModal() {
    this.modalService.open({
      component: FriendCardComponent,
      title: 'Freunde hinzufügen',
      buttonText: 'Fertig',
      size: ModalSize.LARGE,
    });
  }

  async onFriendRemove(friendId: string) {
    try {
      const response = await firstValueFrom(this.httpService.delete(`/friendship/${friendId}`));

      const friendshipsAfterDelete = await firstValueFrom(this.httpService.get<any>('/friendship'));

      this.friends = friendshipsAfterDelete.friends;
      this.filteredFriends = this.friends; // hier bitte einmal kombinieren
    } catch (error) {
      console.error('Error while deleting friend', error);
    }
  }
}
