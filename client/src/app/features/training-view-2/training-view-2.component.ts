import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BasicInfoModalOptionsBuilder } from '../../core/services/modal/basic-info/basic-info-modal-options-builder';
import { ModalService } from '../../core/services/modal/modal.service';
import { DropdownComponent } from '../../shared/components/dropdown/dropdown.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { NavigationArrowsComponent } from '../../shared/components/navigation-arrows/navigation-arrows.component';
import { ExerciseCategories } from '../training-plans/model/exercise-categories';
import { ExerciseDataService } from '../training-plans/training-view/exercise-data.service';
import { Exercise } from '../training-plans/training-view/training-exercise';
import { TrainingViewService } from '../training-plans/training-view/training-view-service';
import { AddRowButtonComponent } from './add-row-button/add-row-button.component';
import { CategoryValues } from './category-values.eum';
import { TrainingViewTableRowComponent } from './training-view-table-row/training-view-table-row.component';

@Component({
  selector: 'app-training-view-2',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddRowButtonComponent,
    DropdownComponent,
    InputComponent,
    TrainingViewTableRowComponent,
    NavigationArrowsComponent,
  ],
  templateUrl: './training-view-2.component.html',
  styleUrls: ['./training-view-2.component.scss'],
  providers: [TrainingViewService, ExerciseDataService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingView2Component implements OnInit, AfterViewInit, OnDestroy {
  trainingGrid = viewChild<ElementRef>('trainingGrid');

  categoryOptions = signal<string[]>(Object.values(CategoryValues));

  testEntries = signal<Exercise[]>([
    {
      category: 'Squat',
      exercise: 'Lowbar-Squat',
      sets: 4,
      reps: 8,
      weight: '100',
      targetRPE: 8,
      actualRPE: '6',
      estMax: 120,
    },
    {
      category: 'Bench',
      exercise: 'Bench Press',
      sets: 3,
      reps: 12,
      weight: '60',
      targetRPE: 7,
      actualRPE: '6',
      estMax: 70,
    },
    {
      category: 'Legs',
      exercise: 'GHR',
      sets: 3,
      reps: 12,
      weight: '60',
      targetRPE: 7,
      actualRPE: '6',
      estMax: 70,
    },
  ]);

  /**
   * Computed signal to generate an array of exercise indices based on the number of rows.
   */
  numberOfExercises = computed(() => Array.from({ length: this.testEntries().length }, (_, i) => i + 1));

  /**
   * Signal controlling the visibility of the "Add Row" button.
   */
  showAddRowButton = signal(false);

  allowRemovalOfDefinedRows = signal(false);

  /**
   * Listener for mouse move events to check the mouse position.
   */
  private mouseMoveListener!: (event: MouseEvent) => void;

  constructor(
    private modalService: ModalService,
    private trainingViewService: TrainingViewService,
    private exerciseDataService: ExerciseDataService,
  ) {}

  ngOnInit(): void {
    this.trainingViewService.loadExerciseData().subscribe((exerciseData) => {
      this.exerciseDataService.setExerciseData(exerciseData);
    });
  }

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
    this.testEntries.update((entries) => [
      ...entries,
      {
        category: ExerciseCategories.PLACEHOLDER,
        exercise: '',
        sets: 0,
        reps: 0,
        weight: '',
        targetRPE: 0,
        actualRPE: '',
        estMax: 0,
        notes: '',
      },
    ]);
  }

  protected removeRow(): void {
    const entryToRemove = this.getLastExerciseEntry();

    if (!entryToRemove) {
      return;
    }

    if (this.isEntryEmpty(entryToRemove) || this.allowRemovalOfDefinedRows()) {
      this.testEntries.update((entries) => entries.slice(0, -1));
      return;
    }

    if (!this.modalService.isVisible()) {
      const modalOptions = new BasicInfoModalOptionsBuilder()
        .setTitle('Warnung')
        .setButtonText('Verstanden')
        .setInfoText(
          'Du bist dabei eine Übung zu löschen. Bestätige den Vorgang, wenn dies gewollt ist, falls nicht, schließe dieses Modal.',
        )
        .setIsDestructiveAction(true)
        .setOnSubmitCallback(async () => this.allowRemovalOfDefinedRows.set(true))
        .build();

      this.modalService.openBasicInfoModal(modalOptions);
    }
  }

  private getLastExerciseEntry(): Exercise | undefined {
    if (this.testEntries().length === 0) {
      return undefined;
    }

    const lastIndex = this.testEntries().length - 1;
    return this.testEntries()[lastIndex];
  }

  private isEntryEmpty(entry: any): boolean {
    return Object.values(entry).some((value) => value === '');
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