import { CommonModule } from '@angular/common';
import { Component, input, model } from '@angular/core';
import { IconName } from '../../../icon/icon-name';
import { IconComponent } from '../../../icon/icon.component';
import { ModalTab } from '../types/modal-tab';

@Component({
  selector: 'app-modal-pagination',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './modal-pagination.component.html',
  styleUrls: ['./modal-pagination.component.scss'],
})
export class ModalPaginationComponent {
  protected readonly IconName = IconName;
  modalTabs = input<ModalTab[]>([]);

  activeTab = model.required<ModalTab>();

  protected switchTab(tab: ModalTab): void {
    this.activeTab.set(tab);
  }
}
