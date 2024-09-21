import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ModalService } from '../../core/services/modal/modalService';
import { IconBackgroundColor } from '../../shared/components/icon-list-item/icon-background-color';
import { IconListItem } from '../../shared/components/icon-list-item/icon-list-item';
import { IconListeItemComponent } from '../../shared/components/icon-list-item/icon-list-item.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { IconName } from '../../shared/icon/icon-name';
import { IconComponent } from '../../shared/icon/icon.component';
import { ButtonClickService } from '../../shared/service/button-click.service';
import { GymtTicketComponent } from '../gym-ticket/gym-ticket.component';
import { GymTicketService } from '../gym-ticket/gym-ticket.service';
import { ProfileService } from '../profile/profileService';

@Component({
  standalone: true,
  imports: [IconComponent, SpinnerComponent, IconListeItemComponent],
  selector: 'app-profile-2',
  templateUrl: 'profile-2.component.html',
  styleUrls: ['profile-2.component.scss'],
  providers: [GymTicketService],
})
export class ProfileComponent2 implements OnInit {
  protected IconName = IconName;

  protected readonly listItems: IconListItem[] = [
    { label: 'Ticket', iconName: IconName.IMAGE, iconBackgroundColor: IconBackgroundColor.Turquoise },
    { label: 'Social', iconName: IconName.USERS, iconBackgroundColor: IconBackgroundColor.LimeGreen },
    { label: 'Achievements', iconName: IconName.AWARD, iconBackgroundColor: IconBackgroundColor.Orange },
    { label: 'Settings', iconName: IconName.SETTINGS, iconBackgroundColor: IconBackgroundColor.BlueViolet },
  ];

  constructor(
    protected profileService: ProfileService,
    private authService: AuthService,
    private modalService: ModalService,
    private gymTicketService: GymTicketService,
    private buttonClickService: ButtonClickService,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit() {
    this.buttonClickService.buttonClick$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((option): option is string => !!option),
      )
      .subscribe((option: string) => {
        switch (option) {
          case 'Logout':
            this.authService.logout();
            break;

          case 'Editieren':
            console.log('Editieren selected');
            break;

          default:
            console.log('Unknown option');
        }
      });
  }

  protected onListItemClicked(listItem: IconListItem) {
    if (listItem.label === 'Ticket') {
      this.gymTicketService.getGymTicket().subscribe((ticket: string) => {
        this.modalService.open({
          component: GymtTicketComponent,
          title: 'Gym Ticket',
          buttonText: 'Schließen',
          componentData: {
            ticketImage: ticket,
          },
        });
      });
    } else if (listItem.label === 'Settings' || listItem.label == 'Social' || listItem.label === 'Achievements') {
      this.modalService.openBasicInfoModal({
        title: listItem.label,
        buttonText: 'Schließen',
        infoText: 'Leider noch nicht implementiert. Komm später wieder',
      });
    }
  }
}
