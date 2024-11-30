import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { Exercise } from '../../training-plans/training-view/training-exercise';
import { CategoryValues } from '../category-values.eum';

// TODO: hier in den Aufrufstellen einen weg finden tatsächlich das two way binding hier zu verwenden, damit die Datenstruktur immer aktuell bleibt
@Component({
  selector: 'app-training-view-table-row',
  standalone: true,
  imports: [DropdownComponent, FormsModule, CommonModule],
  templateUrl: './training-view-table-row.component.html',
  styleUrls: ['./training-view-table-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingViewTableRowComponent {
  exercise = model.required<Exercise>();

  categoryOptions = signal<string[]>(Object.values(CategoryValues));

  /**
   * Updates a specific property of the `exercise` signal.
   * @param key The name of the property to be updated.
   * @param value The new value for the specified property.
   */
  updateExerciseProperty<K extends keyof Exercise>(key: K, value: Exercise[K]): void {
    this.exercise.update((current) => ({
      ...current,
      [key]: value,
    }));
  }
}
