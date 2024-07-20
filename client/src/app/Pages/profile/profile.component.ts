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
import { ConfirmExerciseResetComponent } from '../../confirm-exercise-reset/confirm-exercise-reset.component';
import { ChangeProfilePictureConfirmationComponent } from '../../change-profile-picture-confirmation/change-profile-picture-confirmation.component';
import { ModalSize } from '../../../service/modalSize';
import { ModalEventsService } from '../../../service/modal-events.service';
import { Subject, Subscription } from 'rxjs';
import { HttpClientService } from '../../../service/http-client.service';
import { HttpMethods } from '../../types/httpMethods';
import { ToastService } from '../../toast/toast.service';
import { ToastType } from '../../toast/toastType';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  standalone: true,
  imports: [SpinnerComponent],
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profile!: User;
  isLoading = true;

  @ViewChild('profileImage', { static: false })
  profileImageElement!: ElementRef;
  @ViewChild('fileInput', { static: false }) fileInputElement!: ElementRef;

  private subscription: Subscription = new Subscription();

  constructor(
    private profileService: ProfileService,
    private imageUploadService: ImageUploadService,
    private renderer: Renderer2,
    private modalService: ModalService,
    private modalEventsService: ModalEventsService,
    private httpService: HttpClientService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (data) => {
        console.log(
          '🚀 ~ ProfileComponent ~ this.profileService.getProfile ~ data:',
          data
        );
        this.profile = data.userDto;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Fehler beim Abrufen des Profils', err);
        this.isLoading = false;
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
}
