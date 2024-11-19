import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ModalOptionsBuilder } from '../../core/services/modal/modal-options-builder';
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
import { UserBestPerformanceService } from '../../shared/service/user-best-performance/user-best-performance.service';
import { GymTicketComponent } from '../gym-ticket/gym-ticket.component';
import { GymTicketService } from '../gym-ticket/gym-ticket.service';
import { HeaderService } from '../header/header.service';
import { ActivityCalendarData } from './activity-calendar/activity-calendar-data';
import { ActivityCalendar } from './activity-calendar/activity-calendar.component';
import { ChangeProfilePictureConfirmationComponent } from './change-profile-picture-confirmation/change-profile-picture-confirmation.component';
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
    {
      label: 'Exercises',
      iconName: IconName.DATABASE,
      iconBackgroundColor: IconBackgroundColor.DodgerBlue,
      onItemClicked: () => {
        this.router.navigate(['profile/exercises']);
      },
    },
    {
      label: 'Bestleistungen',
      iconName: IconName.AWARD,
      iconBackgroundColor: IconBackgroundColor.Orange,
      onItemClicked: () => this.showUserbestPerformanceModal(),
    },
    {
      label: 'Progression',
      iconName: IconName.BAR_CHART,
      iconBackgroundColor: IconBackgroundColor.LimeGreen,
      onItemClicked: () => {
        this.router.navigate(['profile/progression']);
      },
    },
    {
      label: 'Ticket',
      iconName: IconName.IMAGE,
      iconBackgroundColor: IconBackgroundColor.Turquoise,
      onItemClicked: () => this.showUserTicketModal(),
    },
    {
      label: 'Settings',
      iconName: IconName.SETTINGS,
      iconBackgroundColor: IconBackgroundColor.DarkGray,
      onItemClicked: () => this.showSettingsModal(),
    },
    {
      label: 'Account löschen',
      iconName: IconName.Trash,
      iconBackgroundColor: IconBackgroundColor.OrangeRed,
      onItemClicked: () => {},
    },
  ];

  constructor(
    protected profileService: ProfileService,
    private authService: AuthService,
    private headerService: HeaderService,
    private modalService: ModalService,
    private toastService: ToastService,
    private imageUploadService: ImageUploadService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.setHeadlineInfo();

    this.initializeActivityCalendar();

    this.route.queryParams.subscribe((params) => {
      if (params['openSettings'] === 'true') {
        this.showSettingsModal();
      }
    });
  }

  private initializeActivityCalendar(): void {
    this.activityCalendarData$ = this.profileService.getActivityCalendarData();
  }

  private showUserTicketModal(): void {
    const modalOptions = new ModalOptionsBuilder()
      .setComponent(GymTicketComponent)
      .setTitle('Gym Ticket')
      .setButtonText('Speichern')
      .build();

    this.modalService.open(modalOptions);
  }

  private showUserbestPerformanceModal(): void {
    const modalOptions = new ModalOptionsBuilder()
      .setComponent(UserBestPerformanceService)
      .setTitle('Bestleistungen')
      .setButtonText('Verstanden')
      .build();

    this.modalService.open(modalOptions);
  }

  protected async showProfilePictureChangeDialog(event: Event) {
    const uploadedPictureBase64Str = await this.imageUploadService.handleImageUpload(event, true);

    if (!uploadedPictureBase64Str) {
      return;
    }

    const currentProfilePicture = this.profileService.pictureUrl();

    const componentData = {
      oldProfilePicture: currentProfilePicture,
      image: uploadedPictureBase64Str,
    };

    const modalOptions = new ModalOptionsBuilder()
      .setComponent(ChangeProfilePictureConfirmationComponent)
      .setTitle('Profilbild ändern')
      .setButtonText('Bestätigen')
      .setAlternativeButtonText('Zuschneiden')
      .setComponentData(componentData)
      .build();

    this.modalService.open(modalOptions);
  }

  private showSettingsModal() {
    const modalConfig = new ModalOptionsBuilder()
      .setComponent(SettingsComponent)
      .setTitle('Einstellungen')
      .setButtonText('Speichern')
      .build();

    this.modalService.open(modalConfig);
  }

  private async showDeleteAccountDialog() {
    const confirmed = await this.modalService.openDeletionModal({
      title: 'Account löschen',
      buttonText: 'Löschen',
      isDestructiveAction: true,
      infoText:
        'Bist du dir sicher, dass du deinen Account löschen willst? Du musst diese Aktion per Email bestätigen.',
      deletionKeyWord: this.profileService.username()!,
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
