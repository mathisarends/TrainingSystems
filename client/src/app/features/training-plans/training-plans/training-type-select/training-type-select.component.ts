import { Component, model, signal } from '@angular/core';
import { SelectComponent } from '../../../../shared/components/select/select.component';

@Component({
  standalone: true,
  imports: [SelectComponent],
  selector: 'app-training-type-select',
  templateUrl: './training-type-select.component.html',
  styleUrls: ['./training-type-select.component.scss'],
})
export class TrainingTypeSelect {
  /**
   * Holds the selected options from the multi-select.
   * Requires at least one selection.
   */
  selectedOptions = model.required<string[]>();

  /**
   * Available training types for selection in the dropdown.
   */
  trainnigTypeOptions = signal(['Trainingspläne', 'Training Session']);
}
