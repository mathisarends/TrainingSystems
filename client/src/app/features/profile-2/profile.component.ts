import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ModalService } from '../../core/services/modal/modalService';
import { IconBackgroundColor } from '../../shared/components/icon-list-item/icon-background-color';
import { IconListItem } from '../../shared/components/icon-list-item/icon-list-item';
import { IconListeItemComponent } from '../../shared/components/icon-list-item/icon-list-item.component';
import { ChartSkeletonComponent } from '../../shared/components/loader/chart-skeleton/chart-skeleton.component';
import { ProfilePictureWithInfoComponent } from '../../shared/components/profile-picture-with-info/profile-picture-with-info.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { IconName } from '../../shared/icon/icon-name';
import { ImageUploadService } from '../../shared/service/image-upload.service';
import { NotificationService } from '../../shared/service/notification.service';
import { GymTicketComponent } from '../gym-ticket/gym-ticket.component';
import { GymTicketService } from '../gym-ticket/gym-ticket.service';
import { HeaderService } from '../header/header.service';
import { ActivityCalendarData } from './activity-calendar/activity-calendar-data';
import { ActivityCalendar } from './activity-calendar/activity-calendar.component';
import { ChangeProfilePictureConfirmationComponent } from './change-profile-picture-confirmation/change-profile-picture-confirmation.component';
import { FriendModalComponent } from './friend-modal/friend-modal.component';
import { ProfileService } from './service/profileService';
import { SettingsComponent } from './settings/settings.component';

@Component({
  standalone: true,
  imports: [
    SpinnerComponent,
    IconListeItemComponent,
    ActivityCalendar,
    CommonModule,
    ChartSkeletonComponent,
    ProfilePictureWithInfoComponent,
    SpinnerComponent,
  ],
  selector: 'app-profile',
  templateUrl: 'profile.component.html',
  styleUrls: ['profile.component.scss'],
  providers: [GymTicketService],
})
export class ProfileComponent2 implements OnInit {
  protected IconName = IconName;

  @ViewChild('profilePicture', { static: false })
  profilePictureElement!: ElementRef;

  activityCalendarData$!: Observable<ActivityCalendarData>;

  protected readonly listItems: IconListItem[] = [
    { label: 'Exercises', iconName: IconName.DATABASE, iconBackgroundColor: IconBackgroundColor.DodgerBlue }, // Blau für Information
    { label: 'Progression', iconName: IconName.BAR_CHART, iconBackgroundColor: IconBackgroundColor.LimeGreen }, // Grün für Fortschritt
    { label: 'Ticket', iconName: IconName.IMAGE, iconBackgroundColor: IconBackgroundColor.Turquoise }, // Türkis für Dokumente oder Support
    { label: 'Settings', iconName: IconName.SETTINGS, iconBackgroundColor: IconBackgroundColor.DarkGray }, // Grau für Einstellungen
    { label: 'Account löschen', iconName: IconName.Trash, iconBackgroundColor: IconBackgroundColor.OrangeRed }, // Rot für kritische Aktionen
  ];

  constructor(
    protected profileService: ProfileService,
    protected notificationService: NotificationService,
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

    this.initializeActivityCalendar();

    this.route.queryParams.subscribe((params) => {
      if (params['openSettings'] === 'true') {
        this.displaySettingsModal();
      }
    });
  }

  private initializeActivityCalendar(): void {
    this.activityCalendarData$ = this.profileService.getActivityCalendarData();
  }

  protected async onListItemClicked(label: string) {
    if (label === 'Ticket') {
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
          image: ticket ?? 'noGymTicketAvailable',
        });
      });
    } else if (label === 'Exercises') {
      this.router.navigate(['profile/exercises']);
    } else if (label === 'Account löschen') {
      this.showDeleteAccountDialog();
    } else if (label === 'Progression') {
      this.router.navigate(['profile/progression']);
    } else if (label === 'Social') {
      this.modalService.open({
        component: FriendModalComponent,
        title: 'Test',
        buttonText: 'Test',
      });
    } else {
      this.modalService.openBasicInfoModal({
        title: label,
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
