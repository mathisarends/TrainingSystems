import { Component, input } from '@angular/core';
import { IconName } from '../../icon/icon-name';
import { IconBackgroundColor } from '../icon-list-item/icon-background-color';
import { IconListeItemComponent } from '../icon-list-item/icon-list-item.component';
import { InfoComponent } from '../info/info.component';

@Component({
  selector: 'app-no-statistics-available',
  standalone: true,
  imports: [IconListeItemComponent, InfoComponent],
  templateUrl: './no-statistics-available.component.html',
  styleUrls: ['./no-statistics-available.component.scss'],
})
export class NoStatisticsAvailableComponent {
  protected readonly IconBackgroundColor = IconBackgroundColor;
  protected readonly IconName = IconName;

  infoText = input('Für dieses Training sind noch keine Daten verfügbar. Starte jetzt ein Training.');
}
