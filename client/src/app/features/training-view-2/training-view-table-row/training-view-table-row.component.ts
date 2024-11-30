import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { Exercise } from '../../training-plans/training-view/training-exercise';
import { CategoryValues } from '../category-values.eum';

@Component({
  selector: 'app-training-view-table-row',
  standalone: true,
  imports: [DropdownComponent, FormsModule, CommonModule],
  templateUrl: './training-view-table-row.component.html',
  styleUrls: ['./training-view-table-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingViewTableRowComponent {
  exercise = input.required<Exercise>();

  categoryOptions = signal<string[]>(Object.values(CategoryValues));
}
