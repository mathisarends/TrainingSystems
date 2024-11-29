import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { AddRowButtonComponent } from './add-row-button/add-row-button.component';

@Component({
  selector: 'app-test-features',
  standalone: true,
  imports: [CommonModule, AddRowButtonComponent],
  templateUrl: './test-features.component.html',
  styleUrls: ['./test-features.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestFeaturesComponent implements AfterViewInit, OnDestroy {
  trainingGrid = viewChild<ElementRef>('trainingGrid');

  /**
   * Signal to manage the number of rows (exercises) in the table.
   */
  private numberOfRows = signal(4);

  /**
   * Computed signal to generate an array of exercise indices based on the number of rows.
   */

  numberOfExercises = computed(() => Array.from({ length: this.numberOfRows() }, (_, i) => i + 1));

  /**
   * Signal controlling the visibility of the "Add Row" button.
   */
  showAddRowButton = signal(false);

  /**
   * Listener for mouse move events to check the mouse position.
   */
  private mouseMoveListener!: (event: MouseEvent) => void;

  /**
   * Registers a global mouse move listener after the view is initialized.
   */
  ngAfterViewInit(): void {
    this.mouseMoveListener = this.checkMousePosition.bind(this);
    document.addEventListener('mousemove', this.mouseMoveListener);
  }

  /**
   * Removes the global mouse move listener when the component is destroyed.
   */
  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.mouseMoveListener);
  }

  protected addRow(): void {
    this.numberOfRows.update((rows) => rows + 1);
  }

  protected removeRow(): void {
    this.numberOfRows.update((rows) => rows - 1);
  }

  /**
   * Checks the mouse position to determine if the "Add Row" button should be visible.
   *
   * The button is visible when:
   * - The mouse is within the defined area below the grid (`isBelowGrid`).
   * - The mouse is hovering over the last exercise row (`isOverLastExercise`).
   */
  private checkMousePosition(event: MouseEvent): void {
    if (!this.trainingGrid()) return;

    const gridRect = this.trainingGrid()!.nativeElement.getBoundingClientRect();
    const mouseY = event.clientY;

    const isBelowGrid = mouseY > gridRect.bottom && mouseY <= gridRect.bottom + 55;

    const isOverLastExercise = mouseY <= gridRect.bottom && mouseY >= gridRect.bottom - 37;

    const showAddRowButton = isBelowGrid || isOverLastExercise;

    this.showAddRowButton.set(showAddRowButton);
  }
}
