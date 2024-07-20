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
import { ImageUploadService } from '../../image-upload.service';
import { ModalService } from '../../../service/modalService';
import { ChangeProfilePictureConfirmationComponent } from '../../change-profile-picture-confirmation/change-profile-picture-confirmation.component';
import { ModalSize } from '../../../service/modalSize';
import { ModalEventsService } from '../../../service/modal-events.service';
import { Subscription } from 'rxjs';
import { HttpClientService } from '../../../service/http-client.service';
import { HttpMethods } from '../../types/httpMethods';
import { TabStripComponent } from '../../tab-strip/tab-strip.component';
import { HttpErrorHandlerService } from '../../http-error-handler.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  standalone: true,
  imports: [SpinnerComponent, TabStripComponent],
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

  constructor(
    private profileService: ProfileService,
    private imageUploadService: ImageUploadService,
    private renderer: Renderer2,
    private modalService: ModalService,
    private modalEventsService: ModalEventsService,
    private httpService: HttpClientService,
    private httpErrorHandler: HttpErrorHandlerService
  ) {}

  ngOnInit(): void {
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
}
