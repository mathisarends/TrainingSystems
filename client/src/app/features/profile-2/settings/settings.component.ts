import { Component, OnInit, signal } from '@angular/core';
import { PermissionDto } from '@shared/settings/permission.dto';
import { CheckboxItem } from '../../../shared/components/checbkox/checkbox-item';
import { CheckboxComponent } from '../../../shared/components/checbkox/checkbox.component';
import { OnConfirm } from '../../../shared/components/modal/on-confirm';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { SettingsService } from './settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CheckboxComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  providers: [SettingsService],
})
export class SettingsComponent implements OnInit, OnConfirm {
  protected checkboxItems = signal<CheckboxItem[]>([]);

  constructor(
    private settingsService: SettingsService,
    private toastService: ToastService,
  ) {}

  /**
   * Initializes the component by fetching user permissions from the backend
   * and updating the checkbox items accordingly.
   */
  ngOnInit() {
    this.settingsService.getPermissions().subscribe((response) => {
      this.checkboxItems.set([
        {
          label: 'Trainingszusammenfassungen (Email)',
          isChecked: response.isTrainingSummaryEmailEnabled,
        },
      ]);
    });
  }

  /**
   * Handles the change event of a checkbox item and updates the checkboxItems signal.
   */
  protected onCheckboxValueChange(item: CheckboxItem) {
    const updatedItems = this.checkboxItems().map((checkboxItem) =>
      checkboxItem.label === item.label ? { ...checkboxItem, isChecked: item.isChecked } : checkboxItem,
    );
    this.checkboxItems.set(updatedItems);
  }

  /**
   * Saves the updated user permissions to the backend when the modal is confirmed.
   */
  onConfirm(): void {
    const updatedPermissions: PermissionDto = {
      isTrainingSummaryEmailEnabled: this.getTrainingSummaryPermissionItem().isChecked,
    };

    this.settingsService.updatePermissions(updatedPermissions).subscribe((response) => {
      this.toastService.success(response.message);
    });
  }

  /**
   * Retrieves the CheckboxItem corresponding to 'Trainingszusammenfassungen (Email)'.
   */
  private getTrainingSummaryPermissionItem(): CheckboxItem {
    return this.checkboxItems().find((item) => item.label === 'Trainingszusammenfassungen (Email)')!;
  }
}
