import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { AddRowButtonComponent } from './add-row-button/add-row-button.component';

@Component({
  selector: 'app-test-features',
  standalone: true,
  imports: [CommonModule, AddRowButtonComponent],
  templateUrl: './test-features.component.html',
  styleUrls: ['./test-features.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestFeaturesComponent {
  private numberOfRows = signal(4);

  numberOfExercises = computed(() => Array.from({ length: this.numberOfRows() }, (_, i) => i + 1));

  showAddRowButton = signal(false);

  /**
   * Fügt eine neue Zeile (Übung) hinzu, indem `numberOfRows` erhöht wird.
   */
  addRow(): void {
    this.numberOfRows.update((rows) => rows + 1);
  }

  removeRow(): void {
    this.numberOfRows.update((rows) => rows - 1);
  }

  checkForLastRowHover(exerciseIndex: number): void {
    const isLastExercise = this.numberOfExercises().length - 1 === exerciseIndex;
    console.log('🚀 ~ TestFeaturesComponent ~ checkForLastRowHover ~ isLastExercise:', isLastExercise);
    this.showAddRowButton.set(isLastExercise);
  }
}
