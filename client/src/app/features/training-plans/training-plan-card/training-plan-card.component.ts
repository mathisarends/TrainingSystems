import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { ModalService } from '../../../core/services/modal/modalService';
import { ModalSize } from '../../../core/services/modal/modalSize';
import { IconButtonComponent } from '../../../shared/components/icon-button/icon-button.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { TooltipDirective } from '../../../shared/directives/tooltip.directive';
import { IconName } from '../../../shared/icon/icon-name';
import { IconComponent } from '../../../shared/icon/icon.component';
import { EditTrainingPlanComponent } from '../edit-training-plan/edit-training-plan.component';
import { TrainingPlanCardView } from '../training-view/models/exercise/training-plan-card-view-dto';
import { TrainingPlanService } from '../training-view/services/training-plan.service';
import { TrainingPlanCardService } from './training-plan-card.service';
import { TrainingWeekDayDto } from './training-week-day-dto';

/**
 * Component for displaying and managing a single training plan card.
 */
@Component({
  selector: 'app-training-plan-card',
  standalone: true,
  imports: [CommonModule, TooltipDirective, IconButtonComponent, IconComponent],
  templateUrl: './training-plan-card.component.html',
  styleUrls: ['./training-plan-card.component.scss'],
  providers: [TrainingPlanCardService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingPlanCardComponent {
  protected readonly IconName = IconName;

  /**
   * The training plan data that will be displayed in the card.
   */
  trainingPlan = input.required<TrainingPlanCardView>();

  /**
   * Determines the CSS layout based on screen size (e.g., different column widths for mobile and desktop views).
   */
  columnClass = input.required<string>();

  /**
   * Output: Emits an event when the training plan's constellation has changed.
   */
  changedPlanConstellation = output<void>();

  constructor(
    private router: Router,
    private modalService: ModalService,
    private toastService: ToastService,
    private trainingPlanCardService: TrainingPlanCardService,
    private trainingPlanService: TrainingPlanService,
  ) {}

  /**
   * Navigates to the view page of the training plan.
   * @param id - The ID of the training plan to view.
   */
  viewTrainingPlan(id: string): void {
    this.trainingPlanCardService.getLatestTrainingPlan(id).subscribe((response: TrainingWeekDayDto) => {
      console.log(
        '🚀 ~ TrainingPlanCardComponent ~ this.trainingPlanCardService.getLatestTrainingPlan ~ response:',
        response,
      );
      this.router.navigate(['/training/view'], {
        queryParams: {
          planId: id,
          week: response.weekIndex,
          day: response.dayIndex,
        },
      });
    });
  }

  /**
   * Opens the modal to edit a training plan.
   * @param index - The index of the training plan to edit.
   */
  async showEditTrainingPlanModal(id: string): Promise<void> {
    const edited = await this.modalService.open({
      component: EditTrainingPlanComponent,
      title: 'Trainingsplan bearbeiten',
      buttonText: 'Übernehmen',
      secondaryButtonText: 'Zuschneiden',
      size: ModalSize.LARGE,
      componentData: { id },
    });

    if (edited) {
      this.changedPlanConstellation.emit();
    }
  }

  viewStatistics(id: string): void {
    this.router.navigate([`statistics/${id}`]);
  }

  /**
   * Opens the modal to delete a training plan.
   * @param index - The index of the training plan to delete.
   */
  async showDeleteTrainingPlanModal(): Promise<void> {
    const confirmed = await this.modalService.openBasicInfoModal({
      title: 'Trainingsplan löschen',
      buttonText: 'Löschen',
      isDestructiveAction: true,
      infoText:
        'Bist du dir sicher, dass du dieses Element löschen willst? Diese Änderung kann nicht mehr rückgängig gemacht werden!',
    });

    if (confirmed) {
      this.handleDelete();
    }
  }

  /**
   * Deletes the training plan.
   * @param id - The ID of the training plan to delete.
   */
  private handleDelete(): void {
    this.trainingPlanCardService.deleteTrainingPlan(this.trainingPlan().id).subscribe(() => {
      this.modalService.close();
      this.toastService.success('Plan gelöscht');

      this.trainingPlanService.trainingPlanChanged();

      this.changedPlanConstellation.emit();
    });
  }
}
