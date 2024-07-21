import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  Renderer2,
} from '@angular/core';
import { ProfileService } from './profileService';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { User } from '../../types/user';
import { ImageUploadService } from '../../../service/util/image-upload.service';
import { ModalService } from '../../../service/modal/modalService';
import { ChangeProfilePictureConfirmationComponent } from '../../change-profile-picture-confirmation/change-profile-picture-confirmation.component';
import { ModalSize } from '../../../service/modal/modalSize';
import { ModalEventsService } from '../../../service/modal/modal-events.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { HttpClientService } from '../../../service/http/http-client.service';
import { HttpMethods } from '../../types/httpMethods';

import { HttpErrorHandlerService } from '../../../service/http/http-error-handler.service';
import { FriendCardComponent } from '../../components/friend-card/friend-card.component';
import { TooltipDirective } from '../../../service/tooltip/tooltip.directive';
import { Friend } from '../../components/friend-card/friend';
import { FriendModalComponent } from '../friend-modal/friend-modal.component';
import { AlertComponent } from '../../components/alert/alert.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  standalone: true,
  imports: [
    SpinnerComponent,
    FriendCardComponent,
    TooltipDirective,
    AlertComponent,
  ],
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profile!: User;
  isLoading = true;

  @ViewChild('profileImage', { static: false })
  profileImageElement!: ElementRef;

  @ViewChild('fileInput', { static: false }) fileInputElement!: ElementRef;

  activeTab: string = 'Freunde';

  private subscription: Subscription = new Subscription();

  tabs = [
    { title: 'Freunde', active: true },
    { title: 'Anfragen' },
    { title: 'Ausstehend' },
  ];

  filteredFriends: Friend[] = [];
  friends: Friend[] = [];
  constructor(
    private profileService: ProfileService,
    private imageUploadService: ImageUploadService,
    private renderer: Renderer2,
    private modalService: ModalService,
    private modalEventsService: ModalEventsService,
    private httpService: HttpClientService,
    private httpErrorHandler: HttpErrorHandlerService
  ) {}

  async ngOnInit(): Promise<void> {
    this.httpErrorHandler
      .handleResponse(this.profileService.getProfile())
      .subscribe({
        next: (data) => {
          this.profile = data.userDto;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Fehler beim Abrufen des Profils', err);
        },
        complete: () => {
          console.log('Profil erfolgreich geladen');
        },
      });

    this.subscription.add(
      this.modalEventsService.confirmClick$.subscribe(() =>
        this.uploadProfilePicture()
      )
    );

    this.subscription.add(
      this.modalEventsService.abortClick$.subscribe(() =>
        this.restoreOriginalProfilePicture()
      )
    );

    const response = await firstValueFrom(
      this.httpService.request<any>(HttpMethods.GET, 'friendship')
    );

    this.friends = response.friends;

    this.filteredFriends = this.friends;
  }

  restoreOriginalProfilePicture() {
    this.renderer.setAttribute(
      this.profileImageElement.nativeElement,
      'src',
      this.profile.pictureUrl ?? '/images/profile-placeholder.webp'
    );
  }

  uploadProfilePicture() {
    const currentProfileImageUrl = this.profileImageElement.nativeElement.src;

    this.httpService
      .request<any>(HttpMethods.POST, 'user/update-profile-picture', {
        profilePicture: currentProfileImageUrl,
      })
      .subscribe({
        next: (response) => {
          this.modalService.close();
        },
        error: (err) => {
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
        this.renderer.setAttribute(
          this.profileImageElement.nativeElement,
          'src',
          result
        );

        this.showProfilePictureChangeDialog(result);
      },
      true
    );
  }

  showProfilePictureChangeDialog(newProfilePicture: string) {
    this.modalService.open(
      ChangeProfilePictureConfirmationComponent,
      'Profilbild Ändern',
      'Bestätigen',
      ModalSize.LARGE,
      {
        oldProfilePicture: this.profile.pictureUrl,
        newProfilePicture: newProfilePicture,
      }
    );
  }

  onTabSelected(tabTitle: string) {
    this.activeTab = tabTitle;
  }

  filterFriends(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredFriends = this.friends.filter(
      (friend) =>
        friend.name.toLowerCase().includes(searchTerm) ||
        friend.email.toLowerCase().includes(searchTerm)
    );
  }

  openFriendRequestsModal() {
    throw new Error('Method not implemented.');
  }

  openAddFriendModal() {
    this.modalService.open(
      FriendModalComponent,
      'Freunde hinzufügen',
      'Fertig',
      ModalSize.LARGE
    );
  }
}
