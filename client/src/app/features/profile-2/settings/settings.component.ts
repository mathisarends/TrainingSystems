import { Component, OnInit, signal } from '@angular/core';
import { CheckboxItem } from '../../../shared/components/checbkox/checkbox-item';
import { CheckboxComponent } from '../../../shared/components/checbkox/checkbox.component';
import { OnConfirm } from '../../../shared/components/modal/on-confirm';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { PermissionDto } from './model/permission-dto';
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

  protected onCheckboxValueChange(item: CheckboxItem) {
    const updatedItems = this.checkboxItems().map((checkboxItem) =>
      checkboxItem.label === item.label ? { ...checkboxItem, isChecked: item.isChecked } : checkboxItem,
    );
    this.checkboxItems.set(updatedItems);
  }

  onConfirm(): void {
    const updatedPermissions: PermissionDto = {
      isTrainingSummaryEmailEnabled: this.getTrainingSummaryPermissionItem().isChecked,
    };

    this.settingsService.updatePermissions(updatedPermissions).subscribe((response) => {
      this.toastService.success(response.message);
    });
  }

  private getTrainingSummaryPermissionItem(): CheckboxItem {
    return this.checkboxItems().find((item) => item.label === 'Trainingszusammenfassungen (Email)')!;
  }
}
