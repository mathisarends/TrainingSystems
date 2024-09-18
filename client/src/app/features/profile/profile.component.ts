import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { ActivityCalendar } from '../../components/activity-calendar/activity-calendar.component';
import { Friend } from '../../components/friend-card/friend';
import { FriendCardMode } from '../../components/friend-card/friend-card-mode';
import { FriendCardComponent } from '../../components/friend-card/friend-card.component';
import { HttpService } from '../../core/http-client.service';
import { ModalService } from '../../core/services/modal/modalService';
import { ModalSize } from '../../core/services/modal/modalSize';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { IconButtonComponent } from '../../shared/components/icon-button/icon-button.component';
import { BasicInfoComponent } from '../../shared/components/modal/basic-info/basic-info.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { TooltipDirective } from '../../shared/directives/tooltip.directive';
import { IconName } from '../../shared/icon/icon-name';
import { IconComponent } from '../../shared/icon/icon.component';
import { ImageUploadService } from '../../shared/service/image-upload.service';
import { ChangeProfilePictureConfirmationComponent } from './change-profile-picture-confirmation/change-profile-picture-confirmation.component';
import { FriendModalComponent } from './friend-modal/friend-modal.component';
import { FriendRequestComponent } from './friend-request/friend-request.component';
import { ProfileService } from './profileService';
import { UserData } from './user-data';

@Component({
  selector: 'app-profile',
  standalone: true,
  providers: [ProfileService],
  imports: [
    SpinnerComponent,
    FriendCardComponent,
    TooltipDirective,
    AlertComponent,
    PaginationComponent,
    ActivityCalendar,
    IconComponent,
    IconButtonComponent,
    CommonModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  protected readonly IconName = IconName;

  profile$!: Observable<UserData>;

  @ViewChild('profileImage', { static: false })
  profileImageElement!: ElementRef;

  @ViewChild('fileInput', { static: false }) fileInputElement!: ElementRef;

  filteredFriends: Friend[] = [];
  friends: Friend[] = [];

  existingFriendCardMode = FriendCardMode.REMOVE;
  pendingFriendCardMode = FriendCardMode.ADD;

  constructor(
    private imageUploadService: ImageUploadService,
    private modalService: ModalService,
    private renderer: Renderer2,
    private profileService: ProfileService,
    private httpService: HttpService,
    private toastService: ToastService,
    private router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    this.profile$ = this.profileService.getProfile();

    const response = await firstValueFrom(this.httpService.get<any>('/friendship'));

    this.friends = response?.friends;
    if (this.friends) {
      this.filteredFriends = this.friends; // hier bitte einmal kombinieren
    }
  }

  async restoreOriginalProfilePicture() {
    const profile = await firstValueFrom(this.profile$);

    this.renderer.setAttribute(
      this.profileImageElement.nativeElement,
      'src',
      profile.pictureUrl ?? '/images/profile-placeholder.webp',
    );
  }

  triggerFileInput() {
    this.fileInputElement.nativeElement.click();
  }

  async handleImageUpload(event: Event) {
    const uploadedPictureBase64Str = await this.imageUploadService.handleImageUpload(event, true);

    if (!uploadedPictureBase64Str) {
      return;
    }

    this.renderer.setAttribute(this.profileImageElement.nativeElement, 'src', uploadedPictureBase64Str);

    this.showProfilePictureChangeDialog(uploadedPictureBase64Str);
  }

  async showProfilePictureChangeDialog(newProfilePicture: string) {
    const profile = await firstValueFrom(this.profile$);

    const response = await this.modalService.open({
      component: ChangeProfilePictureConfirmationComponent,
      title: 'Profilbild ändern',
      buttonText: 'Bestäigen',
      size: ModalSize.LARGE,
      componentData: {
        oldProfilePicture: profile.pictureUrl,
        newProfilePicture: newProfilePicture,
      },
    });

    if (response) {
      this.uploadProfilePicture();
    } else {
      this.restoreOriginalProfilePicture();
    }
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
        error: () => {
          this.modalService.close();
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
      component: FriendModalComponent,
      title: 'Freunde hinzufügen',
      buttonText: 'Fertig',
      size: ModalSize.LARGE,
    });
  }

  async onFriendRemove(friendId: string) {
    try {
      await firstValueFrom(this.httpService.delete(`/friendship/${friendId}`));

      const friendshipsAfterDelete = await firstValueFrom(this.httpService.get<any>('/friendship'));

      this.friends = friendshipsAfterDelete?.friends;
      this.filteredFriends = this.friends; // hier bitte einmal kombinieren
    } catch (error) {
      console.error('Error while deleting friend', error);
    }
  }

  async handleAccountDeletion() {
    const response = await this.modalService.open({
      component: BasicInfoComponent,
      title: 'Account löschen',
      buttonText: 'Löschen',
      isDestructiveAction: true,
      componentData: {
        text: 'Diese Aktion ist nicht umkehrbar. Bist du dir sicher, dass du deinen Account löschen willst?',
      },
    });

    if (response) {
      this.httpService.delete('/user/delete-account').subscribe((response) => {
        this.toastService.success('Account erfolgreich gelöscht');
        this.router.navigate(['register']);
      });
    }
  }
}