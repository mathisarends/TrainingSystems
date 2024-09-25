import { Component, OnInit, signal } from '@angular/core';
import { CheckboxItem } from '../../../shared/components/checbkox/checkbox-item';
import { CheckboxComponent } from '../../../shared/components/checbkox/checkbox.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CheckboxComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  protected checkboxItems = signal<CheckboxItem[]>([
    {
      label: 'Trainingszusammenfassungen (Email)',
      isChecked: true,
    },
  ]);

  constructor() {}

  ngOnInit() {}
}
