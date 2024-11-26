import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { DeleteModalOptionsBuilder } from '../../core/services/modal/deletion/delete-modal-options.builder';
import { ModalOptionsBuilder } from '../../core/services/modal/modal-options-builder';
import { ModalService } from '../../core/services/modal/modal.service';
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
import { SetHeadlineInfo } from '../header/set-headline-info';
import { ActivityCalendarData } from './activity-calendar/activity-calendar-data';
import { ActivityCalendar } from './activity-calendar/activity-calendar.component';
import { ChangeProfilePictureConfirmationComponent } from './change-profile-picture-confirmation/change-profile-picture-confirmation.component';
import { PROFILE_PICTURE_URL } from './change-profile-picture-confirmation/profile-picture-injection-token';
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
export class ProfileComponent2 implements OnInit, SetHeadlineInfo {
  protected IconName = IconName;

  @ViewChild('profilePicture', { static: false })
  profilePictureElement!: ElementRef;

  /**
   * List of items displayed in the profile menu with their corresponding actions.
   */
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
      onItemClicked: () => this.showDeleteAccountDialog(),
    },
  ];

  activityCalendarData$!: Observable<ActivityCalendarData>;

  constructor(
    protected profileService: ProfileService,
    private authService: AuthService,
    private headerService: HeaderService,
    private modalService: ModalService,
    private toastService: ToastService,
    private imageUploadService: ImageUploadService,
    private gymTicketService: GymTicketService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.setHeadlineInfo();
    this.activityCalendarData$ = this.profileService.getActivityCalendarData();
  }

  /**
   * Sets the headline information in the header service.
   * Includes options for logging out.
   */
  setHeadlineInfo(): void {
    this.headerService.setHeadlineInfo({
      title: 'Profile',
      buttons: [
        {
          icon: IconName.MORE_VERTICAL,
          options: [{ label: 'Logout', icon: IconName.LOG_OUT, callback: () => this.authService.logout() }],
        },
      ],
    });
  }

  /**
   * Handles the logic for changing the profile picture.
   * Opens a modal for confirmation and possible cropping of the image.
   */
  protected async showProfilePictureChangeDialog(event: Event) {
    const uploadedPictureBase64Str = await this.imageUploadService.handleImageUpload(event, true);

    if (!uploadedPictureBase64Str) {
      return;
    }

    const currentProfilePicture = this.profileService.pictureUrl();

    const componentData = {
      oldProfilePicture: currentProfilePicture,
    };

    const providerMap = new Map().set(PROFILE_PICTURE_URL, uploadedPictureBase64Str);

    const modalOptions = new ModalOptionsBuilder()
      .setComponent(ChangeProfilePictureConfirmationComponent)
      .setTitle('Profilbild ändern')
      .setButtonText('Bestätigen')
      .setAlternativeButtonText('Zuschneiden')
      .setComponentData(componentData)
      .setProviderMap(providerMap)
      .setOnSubmitCallback(async () => await this.uploadProfilePicture(providerMap.get(PROFILE_PICTURE_URL)))
      .build();

    this.modalService.open(modalOptions);
  }

  private async uploadProfilePicture(profilePicture: string): Promise<void> {
    await firstValueFrom(this.profileService.uploadProfilePicture({ profilePicture }));
  }

  /**
   * Opens the settings modal for modifying user preferences.
   */
  private showSettingsModal() {
    const modalConfig = new ModalOptionsBuilder()
      .setComponent(SettingsComponent)
      .setTitle('Einstellungen')
      .setButtonText('Speichern')
      .build();

    this.modalService.open(modalConfig);
  }

  /**
   * Opens the modal to display user best performance data.
   */
  private showUserbestPerformanceModal(): void {
    const modalOptions = new ModalOptionsBuilder()
      .setComponent(UserBestPerformanceService)
      .setTitle('Bestleistungen')
      .setButtonText('Verstanden')
      .build();

    this.modalService.open(modalOptions);
  }

  /**
   * Opens the modal to display the user's gym ticket.
   */
  private showUserTicketModal(): void {
    const providerMap = new Map().set(GymTicketService, this.gymTicketService);

    const modalOptions = new ModalOptionsBuilder()
      .setComponent(GymTicketComponent)
      .setTitle('Gym Ticket')
      .setButtonText('Speichern')
      .setProviderMap(providerMap)
      .setOnSubmitCallback(async () => this.updateUserTicket())
      .build();

    this.modalService.open(modalOptions);
  }

  private async updateUserTicket(): Promise<void> {
    const gymTicket = this.gymTicketService.gymTicket();
    await firstValueFrom(this.gymTicketService.uploadGymTicket({ gymTicket }));
  }

  /**
   * Opens a modal to confirm account deletion.
   * If confirmed, the account deletion process is initiated.
   */
  private showDeleteAccountDialog(): void {
    const modalDeleteOptions = new DeleteModalOptionsBuilder()
      .setTitle('Account löschen')
      .setButtonText('Löschen')
      .setInfoText(
        'Bist du dir sicher, dass du deinen Account löschen willst? Du musst diese Aktion per Email bestätigen.',
      )
      .setDeletionKeyword(this.profileService.username()!)
      .setOnSubmitCallback(async () => this.deleteAccount())
      .build();

    this.modalService.openDeletionModal(modalDeleteOptions);
  }

  /**
   * Handles the account deletion process and shows a success toast on completion.
   */
  private deleteAccount() {
    this.profileService.deleteAccount().subscribe((response) => {
      this.authService.logout();
      this.toastService.success(response.message);
    });
  }
}
