import { Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ModalService } from '../../core/services/modal/modalService';
import { IconBackgroundColor } from '../../shared/components/icon-list-item/icon-background-color';
import { IconListItem } from '../../shared/components/icon-list-item/icon-list-item';
import { IconListeItemComponent } from '../../shared/components/icon-list-item/icon-list-item.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { IconName } from '../../shared/icon/icon-name';
import { IconComponent } from '../../shared/icon/icon.component';
import { ImageUploadService } from '../../shared/service/image-upload.service';
import { GymTicketComponent } from '../gym-ticket/gym-ticket.component';
import { GymTicketService } from '../gym-ticket/gym-ticket.service';
import { HeaderService } from '../header/header.service';
import { RestPauseTimeIndicatorComponent } from '../training-plans/training-view/rest-pause-time-indicator/rest-pause-time-indicator.component';
import { ChangeProfilePictureConfirmationComponent } from './change-profile-picture-confirmation/change-profile-picture-confirmation.component';
import { ProfileService } from './service/profileService';
import { SettingsComponent } from './settings/settings.component';

@Component({
  standalone: true,
  imports: [IconComponent, SpinnerComponent, IconListeItemComponent, RestPauseTimeIndicatorComponent],
  selector: 'app-profile',
  templateUrl: 'profile.component.html',
  styleUrls: ['profile.component.scss'],
  providers: [GymTicketService],
})
export class ProfileComponent2 implements OnInit {
  protected IconName = IconName;

  @ViewChild('profilePicture', { static: false })
  profilePictureElement!: ElementRef;

  inputSignal = signal('');

  protected readonly listItems: IconListItem[] = [
    { label: 'Exercises', iconName: IconName.DATABASE, iconBackgroundColor: IconBackgroundColor.DodgerBlue },
    { label: 'Ticket', iconName: IconName.IMAGE, iconBackgroundColor: IconBackgroundColor.Orange },
    { label: 'Social', iconName: IconName.USERS, iconBackgroundColor: IconBackgroundColor.LimeGreen },
    { label: 'Settings', iconName: IconName.SETTINGS, iconBackgroundColor: IconBackgroundColor.BlueViolet },
    { label: 'Account löschen', iconName: IconName.Trash, iconBackgroundColor: IconBackgroundColor.OrangeRed },
  ];

  constructor(
    protected profileService: ProfileService,
    private authService: AuthService,
    private headerService: HeaderService,
    private modalService: ModalService,
    private toastService: ToastService,
    private gymTicketService: GymTicketService,
    private imageUploadService: ImageUploadService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.setHeadlineInfo();

    this.route.queryParams.subscribe((params) => {
      if (params['openSettings'] === 'true') {
        this.displaySettingsModal();
      }
    });
  }

  protected async onListItemClicked(listItem: IconListItem) {
    if (listItem.label === 'Ticket') {
      this.modalService.open({
        component: GymTicketComponent,
        title: 'Gym Ticket',
        buttonText: 'Speichern',
        secondaryButtonText: 'Zuschneiden',
        componentData: {
          image: '',
        },
      });

      this.gymTicketService.getGymTicket().subscribe((ticket: string) => {
        this.modalService.updateComponentData({
          image: ticket,
        });
      });
    } else if (listItem.label === 'Exercises') {
      this.router.navigate(['exercises']);
    } else if (listItem.label === 'Account löschen') {
      this.showDeleteAccountDialog();
    } else if (listItem.label === 'Settings') {
      this.displaySettingsModal();
    } else {
      this.modalService.openBasicInfoModal({
        title: listItem.label,
        buttonText: 'Schließen',
        infoText: 'Leider noch nicht implementiert. Komm später wieder',
      });
    }
  }

  protected async showProfilePictureChangeDialog(event: Event) {
    const uploadedPictureBase64Str = await this.imageUploadService.handleImageUpload(event, true);

    if (!uploadedPictureBase64Str) {
      return;
    }

    const currentProfilePicture = this.profileService.pictureUrl();

    this.modalService.open({
      component: ChangeProfilePictureConfirmationComponent,
      title: 'Profilbild ändern',
      buttonText: 'Bestäigen',
      secondaryButtonText: 'Zuschneiden',
      componentData: {
        oldProfilePicture: currentProfilePicture,
        image: uploadedPictureBase64Str,
      },
    });
  }

  private displaySettingsModal() {
    this.modalService.open({
      component: SettingsComponent,
      title: 'Einstellungen',
      buttonText: 'Speichern',
    });
  }

  private async showDeleteAccountDialog() {
    const confirmed = await this.modalService.openBasicInfoModal({
      title: 'Account löschen',
      buttonText: 'Löschen',
      isDestructiveAction: true,
      infoText:
        'Bist du dir sicher, dass du deinen Account löschen willst? Du musst diese Aktion per Email bestätigen.',
    });

    if (confirmed) {
      this.handleAccountDeletion();
    }
  }

  private setHeadlineInfo(): void {
    this.headerService.setHeadlineInfo({
      title: 'Profile',
      buttons: [
        {
          icon: IconName.MORE_VERTICAL,
          options: [{ label: 'Logout', icon: IconName.LOG_OUT, callback: this.handleLogout.bind(this) }],
        },
      ],
    });
  }

  private handleLogout(): void {
    this.authService.logout();
  }

  private handleAccountDeletion() {
    this.profileService.deleteAccount().subscribe((response) => {
      this.authService.logout();
      this.toastService.success(response.message);
    });
  }
}
