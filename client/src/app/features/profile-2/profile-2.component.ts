import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalService } from '../../core/services/modal/modalService';
import { IconBackgroundColor } from '../../shared/components/icon-list-item/icon-background-color';
import { IconListItem } from '../../shared/components/icon-list-item/icon-list-item';
import { IconListeItemComponent } from '../../shared/components/icon-list-item/icon-list-item.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { IconName } from '../../shared/icon/icon-name';
import { IconComponent } from '../../shared/icon/icon.component';
import { ButtonClickService } from '../../shared/service/button-click.service';
import { GymTicketService } from '../gym-ticket/gym-ticket.service';
import { TicketPreviewComponentComponent } from '../gym-ticket/ticket-preview-component/ticket-preview-component.component';
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
    { label: 'Ticket', iconName: IconName.IMAGE, iconBackgroundColor: IconBackgroundColor.Orange },
    { label: 'Social', iconName: IconName.USERS, iconBackgroundColor: IconBackgroundColor.Turquoise },
    { label: 'Settings', iconName: IconName.SETTINGS, iconBackgroundColor: IconBackgroundColor.DodgerBlue },
  ];

  constructor(
    protected profileService: ProfileService,
    private modalService: ModalService,
    private gymTicketService: GymTicketService,
    private buttonClickService: ButtonClickService,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit() {
    this.buttonClickService.buttonClick$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {});
  }

  protected onListItemClicked(listItem: IconListItem) {
    if (listItem.label === 'Ticket') {
      this.gymTicketService.getGymTicket().subscribe((ticket: string) => {
        this.modalService.open({
          component: TicketPreviewComponentComponent,
          title: 'Gym Ticket',
          buttonText: 'Schließen',
          componentData: {
            ticketImage: ticket,
          },
        });
      });
    }
  }
}
