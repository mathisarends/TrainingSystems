import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BasicInfoModalOptionsBuilder } from '../../core/services/modal/basic-info/basic-info-modal-options-builder';
import { ModalService } from '../../core/services/modal/modal.service';
import { MobileDeviceDetectionService } from '../../platform/mobile-device-detection.service';
import { DropdownComponent } from '../../shared/components/dropdown/dropdown.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { NavigationArrowsComponent } from '../../shared/components/navigation-arrows/navigation-arrows.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { ExerciseCategories } from '../training-plans/model/exercise-categories';
import { ExerciseDataService } from '../training-plans/training-view/exercise-data.service';
import { Exercise } from '../training-plans/training-view/training-exercise';
import { TrainingViewService } from '../training-plans/training-view/training-view-service';
import { AddRowButtonComponent } from './add-row-button/add-row-button.component';
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
    PaginationComponent,
  ],
  templateUrl: './training-view-2.component.html',
  styleUrls: ['./training-view-2.component.scss'],
  providers: [TrainingViewService, ExerciseDataService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingView2Component implements OnInit, AfterViewInit, OnDestroy {
  trainingGrid = viewChild<ElementRef>('trainingGrid');

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
  ]);

  /**
   * Controls the visibility of the "Add Row" button.
   */
  showAddRowButton = signal(false);

  /**
   * Flag to allow removal of defined rows.
   */
  allowRemovalOfDefinedRows = signal(false);

  /**
   * Listener for global mouse move events.
   */
  private mouseMoveListener!: (event: MouseEvent) => void;

  constructor(
    private modalService: ModalService,
    private trainingViewService: TrainingViewService,
    private exerciseDataService: ExerciseDataService,
    protected mobileDeviceDetectionService: MobileDeviceDetectionService,
    private route: ActivatedRoute,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.trainingViewService
      .loadExerciseData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((exerciseData) => {
        this.exerciseDataService.setExerciseData(exerciseData);
      });

    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      console.log('🚀 ~ TrainingView2Component ~ this.route.queryParams.pipe ~ params:', params);
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

  /**
   * Adds a new row to the exercise grid.
   */
  protected addRow(): void {
    const newEntry: Exercise = {
      category: ExerciseCategories.PLACEHOLDER,
      exercise: '',
      sets: 0,
      reps: 0,
      weight: undefined,
      targetRPE: 0,
      actualRPE: undefined,
      estMax: 0,
      notes: '',
    };

    this.testEntries.update((entries) => [...entries, newEntry]);
  }

  /**
   * Removes the last row from the exercise grid, with confirmation if the row is not empty.
   */
  protected removeRow(): void {
    const lastEntry = this.getLastExerciseEntry();

    if (!lastEntry) return;

    if (this.isEntryEmpty(lastEntry) || this.allowRemovalOfDefinedRows()) {
      this.testEntries.update((entries) => entries.slice(0, -1));
    } else {
      this.showDeletionModal();
    }
  }

  /**
   * Returns the last entry in the exercise grid.
   */
  private getLastExerciseEntry(): Exercise | undefined {
    return this.testEntries().length > 0 ? this.testEntries()[this.testEntries().length - 1] : undefined;
  }

  /**
   * Checks if an entry is empty by verifying its fields.
   */
  private isEntryEmpty(entry: Partial<Exercise>): boolean {
    return entry.category === ExerciseCategories.PLACEHOLDER;
  }

  /**
   * Displays a modal to confirm the removal of a row.
   */
  private showDeletionModal(): void {
    if (this.modalService.isVisible()) return;

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

  /**
   * Checks the mouse position to toggle the visibility of the "Add Row" button.
   */
  private checkMousePosition(event: MouseEvent): void {
    const gridElement = this.trainingGrid()?.nativeElement;
    if (!gridElement) return;

    const gridRect = gridElement.getBoundingClientRect();
    const mouseY = event.clientY;

    const isBelowGrid = mouseY > gridRect.bottom && mouseY <= gridRect.bottom + 55;
    const isOverLastExercise = mouseY <= gridRect.bottom && mouseY >= gridRect.bottom - 37;

    this.showAddRowButton.set(isBelowGrid || isOverLastExercise);
  }
}
